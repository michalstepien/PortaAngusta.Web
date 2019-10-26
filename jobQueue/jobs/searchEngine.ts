// tslint:disable-next-line:variable-name
const se_scraper = require('se-scraper');
import { SearchSettings } from '../../app/models/searchSettings';

interface ISearchOutput {
    link?: string;
    snippet?: string;
    rank?: number;
    title?: string;
    keyword: string;
    searchEngine: string;
}

// tslint:disable-next-line:only-arrow-functions
module.exports = async function(d: any) {
    console.log('job start', d.data);
    const dstart = new Date();

    const results: ISearchOutput[] = [] as any;
    const settings: SearchSettings = d.data.settings;

    const id: SearchSettings = d.data.id;
    const browserConfig = {
        debug_level: 1
    };
    const scrapeJob = {
        search_engine: 'google',
        keywords: settings.keywords,
        num_pages: settings.numberPages,
    };
    const scraper = new se_scraper.ScrapeManager(browserConfig);
    await scraper.start();
    for (const se of settings.searchEngines) {
        scrapeJob.search_engine = se;
        const r = await scraper.scrape(scrapeJob);
        Object.entries(r.results).forEach(([key, val]) => {
            const keyword = key;
            Object.entries(val).forEach(([key2, val2]) => {
                const r2 = val2.results.map( (x: any) => {
                    return  {
                        link: 'google_image' ? x.clean_link : x.link,
                        snippet: x.snippet,
                        rank: x.rank,
                        title: x.title,
                        keyword,
                        searchEngine: se
                    } as ISearchOutput;
                });
                results.push(...r2);
            });
          });
    }
    await scraper.quit();
    console.log('job end');
    return Promise.resolve({ r: results, id, dstart, dstop: new Date() });
};
