import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import passportFacebook from 'passport-facebook';
import passportLocal from 'passport-local';
import swaggerUi from 'swagger-ui-express';
import connection from './db';
import LiveQueries from './db/live';
import {Company} from './models/company';
import createController from './routes';
import process from 'process';

dotenv.config();

class App {
    public app: express.Application;
    private port = process.env.SERVER_HTTP_PORT;
    private LocalStrategy = passportLocal.Strategy;
    private FacebookStrategy = passportFacebook.Strategy;
    private lq: LiveQueries = null;

    constructor() {
        this.app = express();
        this.configMiddelwares();
    }

    public async initialize(): Promise<any> {
        this.onExit();
        this.configPasport();
        await this.initDB();
        this.app.use(await createController());
        await this.app.listen(this.port);
        console.log('\x1b[36m%s\x1b[0m', `SERVER STARTED at http://localhost:${this.port}`);

        this.configSwagger();
        await this.configLiveQueries();

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
                if (typeof value === 'object' &&  value instanceof Map) {
                    return Object.fromEntries(value);
                }
                if (typeof value === 'object' &&  value instanceof Set) {
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

    private async configLiveQueries() {
        this.lq = new LiveQueries();
        const c = new Company();
        await this.lq.subscribe(c);
        this.lq.on(c, (data: any) => {
        });
    }

    private async initDB(): Promise<any> {
        await connection.init();
        await connection.ses();
    }

    private onExit() {
        [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType: any) => {
            process.on(eventType, this.cleanUpServer.bind(this, eventType));
        });
    }

    private cleanUpServer(evt: string) {
        console.log('Cleanup!', evt);
        if (this.lq) {
            this.lq.unsubscribeAll();
        }
        process.exit(0);
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
