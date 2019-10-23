import { BaseController, Controller, Get, Post, Description, Return, Param, Query, Body, IResults } from './base';
import { Job, JobType } from '../models/job';
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
            await queueSearchEngine.add({id: j.id, settings: r.searchSettings});
        }
        return {ok: true};
    }

}
