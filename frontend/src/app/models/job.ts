export class Job {
    public name = '';
    public description = '';
    public typeJob = JobType.script;
    public status = JobStatut.waiting;
    public dateStart?: Date;
    public dateStop?: Date;

    constructor() {
    }
}

export enum JobType {
    script = 0,
    search = 1
}

export enum JobStatut {
    waiting = 0,
    active = 1,
    stalled = 2,
    progress = 3,
    completed = 4,
    failed = 5
}
