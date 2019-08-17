import { Base, dbProperty, ModelClass } from "./base";

@ModelClass("ORole")
export class Role extends Base<Role> {
    public id: string = "";
    public name: string = "";

    constructor() {
        super(Role);
    }
}
