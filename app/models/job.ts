import { Base, dbProperty, ModelClass } from './base';

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

    constructor() {
        super(Job);
    }
}

enum JobType {
    script = 0,
    search = 1
}

enum JobStatut {
    waiting = 0,
    active = 1,
    stalled = 2,
    progress = 3,
    completed = 4,
    failed = 5
}
