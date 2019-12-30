import { Base, dbProperty, ModelClass, dbTypes } from './base';
import { Job } from './job';

@ModelClass('JobCrawler')
export class JobCrawler extends Base<JobCrawler> {

    @dbProperty()
    public url = '';

    @dbProperty()
    public status = JobCrawlerStatus.waiting;

    @dbProperty()
    public deep = 0;

    @dbProperty()
    public output: any = null;

    @dbProperty()
    public dateStart: Date;

    @dbProperty()
    public dateStop: Date;

    @dbProperty(null, dbTypes.Link, Job)
    public job: Job = null;

    constructor() {
        super(JobCrawler);
    }

}

export enum JobCrawlerStatus {
    waiting = 0,
    running = 1,
    executed = 2,
    error = 3
}
