import { Base, dbProperty, ModelClass } from "./base";

@ModelClass("ORole")
export class Role extends Base<Role> {
    @dbProperty()
    public id: string = "";
    @dbProperty()
    public name: string = "";

    constructor() {
        super(Role);
    }
}
