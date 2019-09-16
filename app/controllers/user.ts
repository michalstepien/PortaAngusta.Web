import { Company } from '../models/company';
import { Address } from '../models/address';
import { User } from '../models/user';
import { BaseController, Controller, Delete, Get, Post, Put, Description, Query, Param, Return } from './base';


@Controller('users')
export class UserController extends BaseController {

    @Description('Get one user from DB')
    @Get('user/:id')
    @Return(User)
    public async getUser(@Param id: string): Promise<User> {
        const usr: User = new User();
        usr.id = id;
        const r = await usr.load();
        return r;
    }

    @Description('Get all users from DB')
    @Get('all')
    public async getUsers(): Promise<User[]> {
        const usr: User = new User();
        const r = usr.loadAll();
        return r;
    }

    @Delete('user/:id')
    public async deleteUser(id: string) {
        return User.deleteById(id);
    }

    @Put('user')
    public async updateUser(id: string) {
        return User.deleteById(id);
    }

    @Post('user')
    public async createUser(user: User) {
        const usr: User = new User();
        const p = usr.importRecord(user);
        const s = await usr.save();

        return s;
    }

    @Get('traverse')
    public async traverse() {
        const usr: User = new User();
        const ret = await usr.traverseFromClass();
        return ret;
    }

    @Get('traverse/:id')
    public async traverseById(id: string) {
        const usr: User = new User();
        usr.id = id;
        const ret = await usr.traverseFromId();
        return ret;
    }

    @Get('company')
    @Description('Get company from DB addressesList')
    @Return(Company)
    public async getCompany() {
        const c: Company = new Company();
        c.id = '21:1';
        const r = await c.load();
        const d = await c.addressesList;
        const e = await c.addressesLinkset;
        const f = await c.addressesMap;
        return c;
    }

    @Get('companysave')
    @Description('Save company')
    @Return(Company)
    public async saveCompany() {
        const c: Company = new Company();
        c.name = 'test company';
        await c.save();
        return c;
    }

    @Get('addresssave')
    @Description('Save address')
    @Return(Company)
    public async saveAddress() {
        const c: Address = new Address();
        c.city = 'Zławieś';
        await c.save();
        return c;
    }

    @Get('companysaveembeded')
    @Description('Save company embbeded')
    @Return(Company)
    public async saveCompanyLink() {
        const c: Company = new Company();
        c.name = 'test company Embeded4';
        const a: Address = new Address();
        a.city = 'Toruń';
        c.addressEmbeded = a;
        await c.save();
        return c;
    }
}
