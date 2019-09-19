import chai from 'chai';
import { Company } from '../../app/models/company';

const expect = chai.expect;

describe('Company', () => {
    describe('save()', () => {
        it('save and load', () => {
            const c = new Company();
            c.name = 'TEST COMPANY';
            return c.save().then(() => {
                const d: Company = new Company();
                d.id = c.id;
                return d.load().then(() => {
                    expect(d.name).to.eql(c.name);
                });
            });
          });
    });

});
