import { Address } from './address';
import { LogDate } from './logDate';
import { Base, dbProperty, dbTypes, ModelClass } from './base';

@ModelClass('Company')
export class Company extends LogDate<Company> {

    luceneIndexes = {
      Company: { name: String()}
    };

    @dbProperty()
    public id = '';

    @dbProperty()
    public name = '';

    @dbProperty(null, dbTypes.Link, Address)
    public mainAddress: Unpacked<Address> = null;

    @dbProperty(null, dbTypes.LinkList, Address)
    public addressesList: Unpacked<Address[]>  = [];

    @dbProperty(null, dbTypes.LinkSet, Address)
    public addressesLinkset: Unpacked<Set<Address>> = new Set<Address>();

    @dbProperty(null, dbTypes.LinkMap, Address)
    public addressesMap: Unpacked<Map<string, Address>> = new Map<string, Address>();

    @dbProperty(null, dbTypes.Embedded, Address)
    public addressEmbeded: Address = null;

    constructor() {
        super(Company);
    }

}




