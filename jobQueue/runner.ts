import Bull from 'bull';
import cluster from 'cluster';
import connection from '../app/db';
import cache from '../app/core/cache';
import { Job, JobStatut } from '../app/models/job';
import { JobResults } from '../app/models/jobResults';
import { JobCrawler, JobCrawlerStatus } from '../app/models/jobCrawler';
import url, { UrlWithStringQuery } from 'url';
import got from 'got';
import cheerio from 'cheerio';
import normalizeUrl from 'normalize-url';
import crypto from 'crypto';
import { CrawlerType } from '../app/models/crawlerSettings';
import { Crawler } from './crawler/crawler';
import { CheerioCrawler } from './crawler/cheerioCrawler';
import { PuppeteerCrawler } from './crawler/puppeteerCrawler';

(async () => {
    try {

        const numWorkers = 4;
        if (cluster.isMaster) {
            for (let i = 0; i < numWorkers; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log('worker ' + worker.process.pid + ' died');
            });
        } else {
            const queueSearchEngine = new Bull('queueSearchEngine', 'redis://localhost:6379');
            await connection.init();
            await connection.ses();

            queueSearchEngine.process(__dirname + '/jobs/searchEngine.js');
            queueSearchEngine.on('error', (error) => {
                console.error('Error:', error);
            });
            queueSearchEngine.on('waiting', (jobId) => {
                console.log('Waiting');
            });
            queueSearchEngine.on('active', (job) => {
                console.log('Active');
            });
            queueSearchEngine.on('stalled', (job) => {
                console.log('stalled');
            });
            queueSearchEngine.on('progress', (job, progress) => {
                console.log('progress');
            });
            queueSearchEngine.on('completed', async (job, result) => {
                const j = new Job();
                j.id = result.id;
                await j.load();
                j.status = JobStatut.completed;
                await j.save();

                const jr = new JobResults();
                jr.job = j;
                jr.results = result.r;
                jr.dateStart = result.dstart;
                jr.dateStop = result.dstop;
                await jr.save();

                console.log('completed');
            });
            queueSearchEngine.on('failed', (job, err) => {
                console.error('failed');
            });

            const queueCrawler = new Bull('queueCrawler', 'redis://localhost:6379');
            queueCrawler.process(async (job) => {
                try {
                    const normalizeOpt: normalizeUrl.Options = {
                        stripWWW: true,
                        stripHash: true,
                        stripAuthentication: true,
                        stripProtocol: true,
                        removeTrailingSlash: true,
                        sortQueryParameters: true
                    };

                    const urlCr = job.data.url;
                    let baseUrl: string = job.data.baseUrl;
                    const parsedUrl = url.parse(urlCr);
                    if (job.data.top) {
                        baseUrl = parsedUrl.host;
                    }
                    const baseUrlMD5 = crypto.createHash('md5').update(baseUrl).digest('hex');
                    const maxDeep = job.data.maxDeep;
                    const currentDeep = job.data.deep;

                    const sameSite = job.data.sameSite;
                    const sameDomain = job.data.sameDomain;
                    const maxLinks = job.data.maxLinks;
                    const maxLinksSite = job.data.maxLinksSite;
                    const timeout = job.data.timeout;

                    const jobId = job.data.id;

                    const remUrlCr = normalizeUrl(urlCr, normalizeOpt);
                    const hash = crypto.createHash('md5').update(jobId + ':' + remUrlCr).digest('hex');
                    await cache.set(hash, remUrlCr);

                    let urlArr: Array<string> = [];
                    const jDB = new Job();
                    jDB.id = jobId;
                    await jDB.load();

                    const jCrawler = new JobCrawler();

                    let jCrSaved: Array<{ url: string, id: string }> = [];
                    try {
                        jCrSaved = await jCrawler.collection()
                            .where(z => z.job.id === jobId && z.url === remUrlCr, { jobId, remUrlCr })
                            .select(z => ({ url: z.url, id: z.id })).executeProjection();

                        jCrSaved = jCrSaved.map((z: { url: string; id: any }) => {
                            return {
                                url: z.url, id:
                                    z.id.cluster + ':' + z.id.position
                            };
                        }) as Array<{ url: string, id: string }>;
                    } catch (e) {
                        console.log('Error get:', e);
                    }

                    let jCrSaved2: Array<string> = [];
                    try {
                        jCrSaved2 = jCrSaved.map((z: { url: string; }) => z.url) as Array<string>;
                        if (jCrSaved2.includes(remUrlCr)) {
                            return Promise.resolve({ error: false });
                        } else {
                            // console.log('Process:', remUrlCr);
                            jCrawler.url = remUrlCr;
                            jCrawler.deep = currentDeep;
                            jCrawler.job = jDB;
                            jCrawler.status = JobCrawlerStatus.running;
                            jCrawler.dateStart = new Date();
                            await jCrawler.save();
                        }
                    } catch (error) {
                        console.log('Error save:', urlCr, error);
                    }

                    try {

                        let jcraw: Crawler = null;
                        if (jDB.crawlerSettings.crawlerType === CrawlerType.cheerio) {
                            jcraw = new CheerioCrawler(urlCr, { baseUrl, sameDomain, sameSite, maxLinksSite });
                        } else if (jDB.crawlerSettings.crawlerType === CrawlerType.puppeteer) {
                            jcraw = new PuppeteerCrawler(urlCr, { baseUrl, sameDomain, sameSite, maxLinksSite });
                        }
                        urlArr = await jcraw.load();

                    } catch (error) {
                        console.log('Parse error', urlCr);
                        jCrawler.job = jDB;
                        jCrawler.status = JobCrawlerStatus.error;
                        jCrawler.dateStop = new Date();
                        await jCrawler.save();
                    }

                    const toDel: Array<string> = [];
                    for (const el of urlArr) {
                        const remUrlCr2 = normalizeUrl(el, normalizeOpt);
                        const hashSave = crypto.createHash('md5').update(jobId + ':' + remUrlCr2).digest('hex');
                        const r = await cache.getRaw(hashSave);
                        if (r) {
                            toDel.push(el);
                        } else {
                            await cache.set(hashSave, remUrlCr2);
                        }
                    }


                    urlArr = urlArr.filter(u => u !== remUrlCr && !toDel.includes(u));
                    urlArr = [...new Set(urlArr)];

                    let linkCntTmp = await cache.getRaw(baseUrlMD5);
                    linkCntTmp = Number(linkCntTmp);
                    if (!linkCntTmp) {
                        linkCntTmp = 0;
                    }
                    if (maxLinks && urlArr.length + linkCntTmp >= maxLinks) {
                        const toGet = maxLinks - linkCntTmp;
                        if (toGet <= urlArr.length) {
                            urlArr = urlArr.slice(0, toGet - 1);
                        }
                    }
                    linkCntTmp = linkCntTmp + urlArr.length;
                    await cache.set(baseUrlMD5, linkCntTmp);

                    if (currentDeep < maxDeep && urlArr.length > 0) {
                        urlArr.forEach((s, i) => {
                            queueCrawler.add({
                                id: jobId,
                                deep: currentDeep + 1,
                                maxDeep,
                                url: s,
                                top: false,
                                baseUrl,
                                sameSite,
                                sameDomain,
                                maxLinks,
                                maxLinksSite,
                                timeout
                            }, { removeOnComplete: true });
                        });
                    }

                    jCrawler.dateStop = new Date();
                    jCrawler.job = jDB;
                    jCrawler.status = JobCrawlerStatus.executed;
                    jCrawler.output = {};
                    await jCrawler.save();

                    return Promise.resolve({ error: false });
                } catch (error) {
                    console.log('Error', error);
                    throw new Error('Error some');
                }


            });
        }

    } catch (e) {

    }
})();


