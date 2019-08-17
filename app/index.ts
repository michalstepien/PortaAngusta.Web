import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import passportFacebook from "passport-facebook";
import passportLocal from "passport-local";
import connection from "./db";
import createController from "./routes";

dotenv.config();

const app = express();
const port = process.env.SERVER_HTTP_PORT; // default port to listen

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

const initConnctionDB = async () => {
  try {
    await connection.init();
    await connection.ses();
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err);
  }
};

initConnctionDB();

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  // User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
  //     if (err) { return done(err); }
  //     if (!user) {
  //         return done(undefined, false, { message: `Email ${email} not found.` });
  //     }
  //     user.comparePassword(password, (err: Error, isMatch: boolean) => {
  //         if (err) { return done(err); }
  //         if (isMatch) {
  //             return done(undefined, user);
  //         }
  //         return done(undefined, false, { message: "Invalid email or password." });
  //     });
  // });
}));

// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false }));
app.use(express.json());

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log("\x1b[36m%s\x1b[0m", `server 8started at http://localhost:${port}`);
});

(async () => {
  app.use(await createController());
})()
.catch((err) => console.error(err));
