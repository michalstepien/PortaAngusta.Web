import { Base, dbProperty, ModelClass } from './base';

@ModelClass('Job')
export class Job extends Base<Job> {

    @dbProperty()
    public name = '';

    @dbProperty()
    public description = '';

    @dbProperty()
    public content = '';

    constructor() {
        super(Job);
    }
}
