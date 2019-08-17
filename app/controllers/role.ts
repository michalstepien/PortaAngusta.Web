import { Role } from "../models/role";
import { BaseController, Controller, Delete, Get, Post, Put } from "./base";

@Controller("roles")
export class RoleController extends BaseController {

    @Get("role/:id")
    public async getRole(id: string) {
        console.log("zadziddała");
        const usr: Role = new Role();
        usr.id = "6:0";
        const r = await usr.load();
        return r;
    }

    @Get("all")
    public async getUsers() {
        const usr: Role = new Role();
        const r = usr.loadAll();
        return r;
    }
}
