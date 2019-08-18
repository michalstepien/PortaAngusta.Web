import { Address } from "./address";
import { Base, dbProperty, dbTypes, ModelClass } from "./base";

@ModelClass("Company")
export class Company extends Base<Company> {

    @dbProperty()
    public id: string = "";

    @dbProperty()
    public name: string = "";

    @dbProperty(null, dbTypes.Link, Address)
    public mainAddress: Promise<Address> = null;

    constructor() {
        super(Company);
    }
}
