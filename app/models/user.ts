import { Base, dbProperty, ModelClass } from "./base";

@ModelClass("OUser")
export class User extends Base<User> {

    @dbProperty()
    public id: string = "";

    @dbProperty()
    public name: string = "";

    @dbProperty("password")
    public haslo: string = "";

    @dbProperty()
    public status: string = "ACTIVE";

    constructor() {
        super(User);
    }
}
