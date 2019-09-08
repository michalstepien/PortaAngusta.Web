import { Address } from './address';
import { Base, dbProperty, dbTypes, ModelClass } from './base';

@ModelClass('Company')
export class Company extends Base<Company> {

    @dbProperty()
    public id = '';

    @dbProperty()
    public name = '';

    @dbProperty(null, dbTypes.Link, Address)
    public mainAddress: Promise<Address> = null;

    @dbProperty(null, dbTypes.LinkList, Address)
    public addressesList: Promise<Address[]> = [] as any;

    // @dbProperty(null, dbTypes.LinkMap, Address)
    // public addressesMap: Promise<Map<string, Address>> = null;

    // @dbProperty(null, dbTypes.LinkSet, Address)
    // public addressesSet: Promise<Set<Address>> = null;

    @dbProperty(null, dbTypes.Embedded, Address)
    public addressEmbeded: Address = null;

    constructor() {
        super(Company);
    }
}
