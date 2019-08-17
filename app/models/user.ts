import { Base, dbProperty, ModelClass } from "./base";

@ModelClass("OUser")
export class User extends Base<User> {
    public id: string = "";
    public name: string = "";

    @dbProperty("password")
    public haslo: string = "";
    public status: string = "ACTIVE";

    constructor() {
        super(User);
    }
}
