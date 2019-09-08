import { Base, dbProperty, ModelClass } from './base';

@ModelClass('ORole')
export class Role extends Base<Role> {
    @dbProperty()
    public id = '';
    @dbProperty()
    public name = '';

    constructor() {
        super(Role);
    }
}
