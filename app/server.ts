import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import passportFacebook from 'passport-facebook';
import passportLocal from 'passport-local';
import swaggerUi from 'swagger-ui-express';
import connection from './db';
import createController from './routes';

dotenv.config();

class App {
    public app: express.Application;
    private port = process.env.SERVER_HTTP_PORT;
    private LocalStrategy = passportLocal.Strategy;
    private FacebookStrategy = passportFacebook.Strategy;

    constructor() {
        this.app = express();
        this.configMiddelwares();
    }

    public async initialize(): Promise<any> {
        this.configPasport();
        await this.initDB();
        this.app.use(await createController());
        await this.app.listen(this.port);
        console.log('\x1b[36m%s\x1b[0m', `SERVER STARTED at http://localhost:${this.port}`);
        this.configSwagger();

        return this.app;
    }

    private configMiddelwares(): void {
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
        this.app.use(express.json());
        this.app.set(
            'json replacer',
            ( key: any, value: any ) => {
                if (typeof value === 'object' && value instanceof Set) {
                    return [...value];
                }
                return value;
            }
        );
    }

    private configSwagger() {
        const options = {
            swaggerOptions: {
              url: `http://localhost:${this.port}/api/swagger-api/docs`
            }
        };
        this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, options));
    }

    private async initDB(): Promise<any> {
        await connection.init();
        await connection.ses();
    }

    private configPasport() {
        passport.use(new this.LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
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
    }

}

const s = new App();

export default async function server(): Promise<any> {
    return await s.initialize();
}
