import { Address } from './address';
import { LogDate } from './logDate';
import { Base, dbProperty, dbTypes, ModelClass } from './base';

@ModelClass('Company')
export class Company extends LogDate<Company> {

    @dbProperty()
    public id = '';

    @dbProperty()
    public name = '';

    @dbProperty(null, dbTypes.Link, Address)
    public mainAddress: Promise<Address> | Address = null;

    @dbProperty(null, dbTypes.LinkList, Address)
    public addressesList: Promise<Address[]> | Address[] = new Array<Address>();

    @dbProperty(null, dbTypes.LinkSet, Address)
    public addressesLinkset: Promise<Set<Address>> | Set<Address> = new Set<Address>();

    @dbProperty(null, dbTypes.LinkMap, Address)
    public addressesMap: Promise<Map<string, Address>> | Map<string, Address> = new Map<string, Address>();

    @dbProperty(null, dbTypes.Embedded, Address)
    public addressEmbeded: Address = null;

    constructor() {
        super(Company);
    }

}
