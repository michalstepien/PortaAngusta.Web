import { Company } from "../models/company";
import { User } from "../models/user";
import { BaseController, Controller, Delete, Get, Post, Put } from "./base";

@Controller("users")
export class UserController extends BaseController {

    @Get("user/:id")
    public async getUser(id: string) {
        const usr: User = new User();
        usr.id = id;
        const r = await usr.load();
        return r;
    }

    @Get("all")
    public async getUsers() {
        const usr: User = new User();
        const r = usr.loadAll();
        return r;
    }

    @Delete("user/:id")
    public async deleteUser(id: string) {
        return User.deleteById(id);
    }

    @Put("user")
    public async updateUser(id: string) {
        return User.deleteById(id);
    }

    @Post("user")
    public async createUser(user: User) {
        const usr: User = new User();
        const p = usr.importRecord(user);
        const s = await usr.save();

        return s;
    }

    @Get("traverse")
    public async traverse() {
        const usr: User = new User();
        const ret = await usr.traverseFromClass();
        return ret;
    }

    @Get("traverse/:id")
    public async traverseById(id: string) {
        const usr: User = new User();
        usr.id = id;
        const ret = await usr.traverseFromId();
        return ret;
    }

    @Get("company")
    public async getCompany() {
        const c: Company = new Company();
        c.id = "21:0";
        const r = await c.load();
        const ret = await r.mainAddress;
        const ret3 = await r.mainAddress;
        console.log(c, ret);
        return c;
    }
}
