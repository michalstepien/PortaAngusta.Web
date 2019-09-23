import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app/server';

chai.use(chaiHttp);
const expect = chai.expect;
let app: any;

before(() => {
  return server().then((p) => {
    app = p;
  });
});

describe('baseRoute', () => {

  it('should be json', () => {
    return chai.request(app).get('/api/users/all')
      .then((res) => {
        expect(res.type).to.eql('application/json');
      });
  });

});
