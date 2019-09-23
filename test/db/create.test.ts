import chai from 'chai';
import { Company } from '../../app/models/company';
import { Address } from '../../app/models/address';

const expect = chai.expect;



describe('MODEL', () => {
    describe('save and load', () => {
        it('should name be equal', async () => {
            const c = new Company();
            c.name = 'TEST COMPANY';
            await c.save();
            const d: Company = new Company();
            d.id = c.id;
            await d.load();
            return expect(d.name).to.eql(c.name);
          });
    });

    describe('save link', () => {
        it('should be city Zławieś Wielka', async () => {
            const a = new Address();
            a.city = 'Zławieś Wielka';
            await a.save();

            const c = new Company();
            c.name = 'TEST COMPANY Adr LINK';
            c.mainAddress = a;
            await c.save();

            const d: Company = new Company();
            d.id = c.id;
            await d.load();
            const m = await d.mainAddress;
            return expect(a.city).to.eql(m.city);
          });
    });

    describe('save embeded', () => {
        it('should be city Toruń', async () => {
            const a = new Address();
            a.city = 'Toruń';

            const c = new Company();
            c.name = 'TEST COMPANY Adr EMBEDED';
            c.addressEmbeded = a;
            await c.save();

            const d: Company = new Company();
            d.id = c.id;
            await d.load();
            return expect(a.city).to.eql(d.addressEmbeded.city);
          });
    });

    describe('save link list', async () => {
        it('should be size 3', async () => {
            const a = new Address();
            a.city = 'Skłudzewo';
            await a.save();

            const b = new Address();
            b.city = 'Toporzysko';
            await b.save();

            const c = new Address();
            c.city = 'Siemoń';
            await c.save();

            const d = new Company();
            d.name = 'TEST COMPANY LINKLIST';
            d.addressesList = [a, b, c];
            await d.save();

            const e: Company = new Company();
            e.id = d.id;
            await e.load();
            const f = await e.addressesList;

            return expect(f.length).to.eql(3);
          });
    });

    describe('save link set', () => {
        it('should be size 3', async () => {
            const a = new Address();
            a.city = 'Czarnowo';
            await a.save();

            const b = new Address();
            b.city = 'Górsk';
            await b.save();

            const c = new Address();
            c.city = 'Stanisławka';
            await c.save();

            const d = new Company();
            d.name = 'TEST COMPANY LINKSET';
            d.addressesLinkset =  new Set([a, b, c]);
            await d.save();

            const e: Company = new Company();
            e.id = d.id;
            await e.load();
            const f = await e.addressesLinkset;

            return expect(f.size).to.eql(3);
          });
    });

    describe('save map', () => {
        it('should be size 3', async () => {
            const a = new Address();
            a.city = 'Czarnowo';
            await a.save();

            const b = new Address();
            b.city = 'Górsk';
            await b.save();

            const c = new Address();
            c.city = 'Stanisławka';
            await c.save();

            const d = new Company();
            d.name = 'TEST COMPANY MAP';
            d.addressesMap =  new Map([['dupa1', a], ['dupa2', b], ['dupa3', c]]);
            await d.save();

            const e: Company = new Company();
            e.id = d.id;
            await e.load();
            const f = await e.addressesMap;

            return expect(f.size).to.eql(3);
          });
    });

    describe('save extended class', () => {
        it('should be date', async () => {
            const d = new Company();
            d.name = 'TEST COMPANY Extended class';
            await d.save();
            const e: Company = new Company();
            e.id = d.id;
            await e.load();
            return expect(e.createDate).to.eql(d.createDate);
          });
    });

});
