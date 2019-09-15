import { Base, dbProperty, ModelClass } from './base';

@ModelClass('Address')
export class Address extends Base<Address> {

    @dbProperty()
    public id = '';

    @dbProperty()
    public city = '';

    constructor() {
        super(Address);
    }
}
