import { Base, dbProperty, ModelClass, dbTypes } from './base';
import { SearchSettings } from './searchSettings';
import { CrawlerSettings } from './crawlerSettings';

@ModelClass('Job')
export class Job extends Base<Job> {

    @dbProperty()
    public name = '';

    @dbProperty()
    public description = '';

    @dbProperty()
    public typeJob = JobType.script;

    @dbProperty()
    public status = JobStatut.waiting;

    @dbProperty()
    public dateStart: Date;

    @dbProperty()
    public dateStop: Date;

    @dbProperty()
    public runType = RunType.manual;

    @dbProperty()
    public delay = 0;

    @dbProperty()
    public crone = '';

    @dbProperty(null, dbTypes.Embedded, SearchSettings)
    public searchSettings: SearchSettings = null;

    @dbProperty(null, dbTypes.Embedded, CrawlerSettings)
    public crawlerSettings: CrawlerSettings = null;

    constructor() {
        super(Job);
    }
}

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
