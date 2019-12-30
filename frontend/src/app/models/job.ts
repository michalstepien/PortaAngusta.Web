import { SearchSettings } from './searchSettings';
import { CrawlerSettings } from './crawlerSettings';

export enum JobType {
    script = 0,
    search = 1,
    crawler = 2
}

export enum JobStatut {
    waiting = 0,
    active = 1,
    stalled = 2,
    progress = 3,
    completed = 4,
    failed = 5
}

export enum RunType {
    manual = 0,
    crone = 1,
    delayed = 2
}

export class Job {
    public id = '';
    public name = '';
    public description = '';
    public typeJob = JobType.script;
    public status = JobStatut.waiting;
    public dateStart?: Date;
    public dateStop?: Date;
    public runType = RunType.manual;
    public delay = 0;
    public crone = '';
    public searchSettings: SearchSettings = null;
    public crawlerSettings: CrawlerSettings = null;

    constructor() {
    }
}
