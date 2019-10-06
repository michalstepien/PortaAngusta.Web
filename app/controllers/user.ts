import { Company } from '../models/company';
import { Address } from '../models/address';
import { User } from '../models/user';
import { Jdg } from '../clusters/jdg';
import { BaseController, Controller, Auth, Delete, Get, Post, Put, Description, Query, Param, Body, Return, Plain } from './base';
import { sign } from 'jsonwebtoken';
import Utils from '../core/utils';
import { app } from '../server';

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
    public async saveCompanyEmbeded() {
        const c: Company = new Company();
        c.name = 'test company Embeded4';
        const a: Address = new Address();
        a.city = 'Toruń';
        c.addressEmbeded = a;
        await c.save();
        return c;
    }

    @Get('companysavelink')
    @Description('Save company link')
    @Return(Company)
    public async saveCompanyLink() {
        const c: Company = new Company();
        c.name = 'test company link';
        const a: Address = new Address();
        a.city = 'Fordon';
        await a.save();
        c.mainAddress = a;
        await c.save();
        return c;
    }

    @Get('companysavelinkset')
    @Description('Save company linkset')
    @Return(Company)
    public async saveCompanyLinkSet() {
        const a: Address = new Address();
        a.city = 'Fordon11';
        await a.save();

        const b: Address = new Address();
        b.city = 'Fordon22';
        await b.save();

        const c: Company = new Company();
        c.name = 'test company linkSET';

        c.addressesLinkset = new Set<Address>([a, b]);
        await c.save();
        return c;
    }

    @Get('companysavelinklist')
    @Description('Save company linklist')
    @Return(Company)
    public async saveCompanyLinkList() {
        const a: Address = new Address();
        a.city = 'Fordon11 LIST';
        await a.save();

        const b: Address = new Address();
        b.city = 'Fordon22 LIST';
        await b.save();

        const c: Company = new Company();
        c.name = 'test company LIST';

        c.addressesList = [a, b];
        await c.save();
        return c;
    }

    @Get('companysavelinkmap')
    @Description('Save company linkmap')
    @Return(Company)
    public async saveCompanyLinkMap() {
        const a: Address = new Address();
        a.city = 'Fordon11 MAP';
        await a.save();

        const b: Address = new Address();
        b.city = 'Fordon22 MAP';
        await b.save();

        const c: Company = new Company();
        c.name = 'test company MAP';

        c.addressesMap = new Map<string, Address>([['dupa1', a], ['dupa2', b]]);
        await c.save();
        await c.addressesMap;
        return c;
    }

    @Get('adresupdate')
    @Description('Save adres update')
    @Return(Address)
    public async saveAdresUpdate() {
        const a: Address = new Address();
        a.city = 'Skludzewo';
        await a.save();

        a.city = 'Siemon';
        await a.save();
        return a;
    }

    @Get('adresdelete')
    @Description('DeleteAdres')
    @Return(Address)
    public async deleteAdres() {
        const a: Address = new Address();
        a.city = 'Cichoradz';
        await a.save();
        const ret = await a.delete();
        return ret;
    }

    @Get('addcompanycluster')
    @Description('Company cluster jdg')
    @Return(Company)
    public async companyCluster() {
        const a: Company = new Company();
        a.name = 'Stepien LTD';
        await a.save(new Jdg());
        return a;
    }

    @Get('linq')
    @Description('linqu example')
    @Return(Company)
    public async linq() {

        const a: Company = new Company();
        const ret = await a.collection().where((t) => t.name === 'test company' || t.name === 'test2').execute();
        const retCount = await a.collection().count().executeProjection();
        const retSel = await a.collection().select((t) =>
            ({
                upper: t.name.toUpperCase(),
                lower: t.name.toLowerCase(),
                length: t.name.lengthString(),
                replace: t.name.replace('t', 'p'),
                trim: t.name.trim(),
                charAt: t.name.charAt(0),
                // indexof: t.name.indexOf('t', 0),
                hash: t.name.hash(),
                typeProp: t.name.type(),
                size: t.addressesList.size()
            }))
            .limit(50).executeProjection();
        const ret2 = await a.collection().select((t) => t.name).count((t) => t.name).groupBy((t) => t.name).executeProjection();
        const ret3 = await a.collection().orderBy((t) => t.name).execute();
        const ret4 = await a.collection().orderBy((t) => t.name).skip(2).limit(5).execute();
        return { where: ret, count: retCount, retSel, groupby: ret2, orderby: ret3, skiplimit: ret4 };
    }

    @Get('linqfromlink')
    @Description('linq from link example')
    @Return(Company)
    public async linqfromProjection() {
        const a: Company = new Company();
        const ret = await a.collection().select((t) => t.mainAddress.city)
            .where((t) => t.mainAddress.city === 'Zławieś Wielka').executeProjection();
        const ret2 = await a.collection().where((t) => t.addressesList.size() > 0).executeProjection();
        const ret3 = await a.collection().select((t) => t.addressesList[0]).where((t) => t.addressesList.size() > 0).executeProjection();
        const ret4 = await a.collection().select((t) => t.addressesList[0].city)
            .where((t) => t.addressesList.size() > 0).executeProjection();
        return { selectFromLink: ret, sizeCollection: ret2, selectFirst: ret3, selectFirstName: ret4 };
    }

    @Auth()
    @Get('linqdelete')
    @Description('linq delete example')
    @Return(Company)
    public async linqDelete() {
        const a: Company = new Company();
        const ret = await a.collection().where((t) => t.addressesList.size() > 40).delete();
        return { howmDel: ret };
    }

    @Get('linqlucene')
    @Description('linq lucene example')
    @Return(Company)
    public async linqLucene() {
        const a: Company = new Company();
        const ret = await a.collection().luceneSearchIndex((t) => t.luceneIndexes.Company.name === '2').execute();
        return { howmDel: ret };
    }

    @Post('auth')
    @Description('auth')
    @Plain()
    public async auth(req: any, res: any) {
        const username = req.body.username;
        const password = req.body.password;
        // For the given username fetch user from DB
        const mockedUsername = 'admin';
        const mockedPassword = 'password';

        if (username && password) {
            if (username === mockedUsername && password === mockedPassword) {
                const token = sign({ username },
                    'dupasecret',
                    {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                return res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }
    }

    @Post('checkpassword')
    @Description('check password')
    public async checkPassword(@Body username: string, @Body password: string) {
        const usr: User = new User();
        const dd = 'janusz1';
        const ret = await usr.collection().where((u) => u.name === username || u.name === dd, {username, dd}).execute();
        if (ret.length > 0) {
            return { ok : Utils.chceckPassword(password, ret[0].password) };
        }
        return { ok: false};
    }

    @Get('cacheset')
    @Description('cache set example')
    public async cache() {
        await app.cache.set('dupawolowaTest', { piesek: 'leszek', kon: 'rafał'});
        return { ok: false};
    }

    @Get('cacheget')
    @Description('cache get example')
    public async cacheget() {
        const ret = await app.cache.get('dupawolowaTest');
        return { ok: ret};
    }
}
