import chai from 'chai';
import { Company } from '../../app/models/company';

const expect = chai.expect;

describe('MODEL SELECT', () => {
  describe('Linq COUNT', () => {
    it('shoud be greater than 0', async () => {
      const a: Company = new Company();
      const retCount = await a.collection().count().executeProjection();
      return expect(retCount).to.gt(0);
    });
  });
  describe('Linq where', () => {
    it('shoud be length eq 0', async () => {
      const a: Company = new Company();
      const retCount = await a.collection().where((t) => t.name === 'Vilnus CO').execute();
      return expect(retCount.length).to.eq(0);
    });
  });
});
