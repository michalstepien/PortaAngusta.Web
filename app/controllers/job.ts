import { BaseController, Controller, Get, Post, Description, Return, Param, Query, Body, IResults } from './base';
import { Job, JobType, RunType } from '../models/job';
import { JobResults } from '../models/jobResults';
import Bull from 'bull';

@Controller('jobs')
export class JobController extends BaseController {

    @Description('Get job from DB')
    @Get('job/:id')
    @Return(Job)
    public async getJob(@Param id: string): Promise<Job> {
        const j: Job = new Job();
        j.id = id;
        const r = await j.load();
        return r;
    }

    @Description('Get jobs from DB')
    @Get('list')
    @Return(Job)
    public async getJobs(@Query limit: number, @Query skip: number): Promise<IResults> {
        return {
            count: await new Job().collection().count().executeProjection(),
            results: await new Job().collection().skip(skip).limit(limit).execute()
        };
    }

    @Description('Get jobs from DB')
    @Get('results/list/:id')
    @Return(Job)
    public async getResults(@Param id: string): Promise<IResults> {
        return {
            count: await new JobResults().collection().where(x => x.job.id === id, { id }).count().executeProjection(),
            results: await new JobResults().collection().select(x => ({
                id: x.id.replace('#', ''),
                start: x.dateStart,
                end: x.dateStop,
                count: x.results.size()
            })).where(x => x.job.id === id, { id }).orderBy(t => t.dateStop, true).executeProjection()
        };
    }

    @Description('Save job to DB')
    @Post('job')
    @Return(Job)
    public async saveJob(@Body job: any): Promise<Job> {
        const j: Job = new Job();
        j.importRecord(job, 'Job');
        await j.save();
        return await j.load();
    }

    @Description('Run job')
    @Get('job/run/:id')
    public async runJob(@Param id: string): Promise<any> {
        const j: Job = new Job();
        j.id = id;
        const r = await j.load();
        if (r.typeJob === JobType.search) {
            const queueSearchEngine = new Bull('queueSearchEngine', 'redis://localhost:6379');
            if (j.runType === RunType.manual) {
                await queueSearchEngine.add({ id: j.id, settings: r.searchSettings }, { removeOnComplete: true });
            } else if (j.runType === RunType.crone) {
                await queueSearchEngine.add({ id: j.id, settings: r.searchSettings },
                    { repeat: { cron: j.crone }, removeOnComplete: true });
            } else if (j.runType === RunType.delayed) {
                await queueSearchEngine.add({ id: j.id, settings: r.searchSettings }, { delay: j.delay, removeOnComplete: true });
            }
        } else if (r.typeJob === JobType.crawler) {
            const queueSearchEngine = new Bull('queueCrawler', 'redis://localhost:6379');
            const data = {
                id: j.id,
                deep: 0,
                maxDeep: r.crawlerSettings.deep,
                url: r.crawlerSettings.startPage,
                sameSite: r.crawlerSettings.sameSite,
                sameDomain: r.crawlerSettings.sameDomain,
                maxLinks: r.crawlerSettings.maxLinks,
                maxLinksSite: r.crawlerSettings.maxLinksSite,
                timeout: r.crawlerSettings.timeout,
                top: true
            };
            if (j.runType === RunType.manual) {
                await queueSearchEngine.add(data, { removeOnComplete: true });
            } else if (j.runType === RunType.crone) {
                await queueSearchEngine.add(data, { repeat: { cron: j.crone }, removeOnComplete: true });
            } else if (j.runType === RunType.delayed) {
                await queueSearchEngine.add(data, { delay: j.delay, removeOnComplete: true });
            }
        }
        return { ok: true };
    }

}
