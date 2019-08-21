import chai from "chai";
import chaiHttp from "chai-http";
import * as mocha from "mocha";
import server from "../app/server";

chai.use(chaiHttp);
const expect = chai.expect;
let app: any;

before(() => {
  return server().then((p) => {
    app = p;
  });
});

describe("baseRoute", () => {

  it("should be json", () => {
    return chai.request(app).get("/api/users/all")
      .then((res) => {
        expect(res.type).to.eql("application/json");
      });
  });

  it("should have a message prop", () => {
    return chai.request(app).get("/")
      .then((res) => {
        expect(res.body.message).to.eql("Hello World!");
      });
  });

});
