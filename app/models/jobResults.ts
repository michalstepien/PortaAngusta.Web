import { Base, dbProperty, ModelClass, dbTypes } from './base';
import { Job } from './job';

@ModelClass('JobResults')
export class JobResults extends Base<JobResults> {

    @dbProperty()
    public dateStart: Date;

    @dbProperty()
    public dateStop: Date;

    @dbProperty(null, dbTypes.Link, Job)
    public job: Job = null;

    @dbProperty()
    public results: any = null;


    constructor() {
        super(JobResults);
    }
}
