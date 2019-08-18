import { Base, dbProperty, ModelClass } from "./base";

@ModelClass("Address")
export class Address extends Base<Address> {

    @dbProperty()
    public id: string = "";

    @dbProperty()
    public City: string = "";

    constructor() {
        super(Address);
    }
}
