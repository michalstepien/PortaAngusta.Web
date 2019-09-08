import { Base, dbProperty, ModelClass } from './base';

@ModelClass('OUser')
export class User extends Base<User> {

    @dbProperty()
    public id = '';

    @dbProperty()
    public name = '';

    @dbProperty('password')
    public haslo = '';

    @dbProperty()
    public status = 'ACTIVE';

    constructor() {
        super(User);
    }
}
