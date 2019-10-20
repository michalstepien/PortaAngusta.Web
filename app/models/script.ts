import { Base, dbProperty, ModelClass } from './base';

@ModelClass('Script')
export class Script extends Base<Script> {

    @dbProperty()
    public name = '';

    @dbProperty()
    public description = '';

    @dbProperty()
    public content = '';

    constructor() {
        super(Script);
    }
}
