import chai from 'chai';
import { User } from '../../app/models/user';

const expect = chai.expect;

describe('User', () => {
    describe('loadAll()', () => {
        it('first admin', () => {
            const usrs = new User();
            return usrs.loadAll()
              .then((u) => {
                expect(u[0].name).to.eql('admin');
              });
          });
    });

});
