import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import connection from './db';
import LiveQueries from './db/live';
import createController from './routes';
import Session from './core/session';
import process from 'process';
import url from 'url';

dotenv.config();

class App {
    public app: express.Application;
    private port = process.env.SERVER_HTTP_PORT;
    private lq: LiveQueries = null;


    constructor() {
        this.app = express();
        this.configMiddelwares();
    }

    public async initialize(): Promise<any> {
        this.onExit();
        await this.initDB();
        // ;
        await this.app.listen(this.port);
        console.log('\x1b[36m%s\x1b[0m', `SERVER STARTED at http://localhost:${this.port}`);

        this.configSwagger();
        await this.configLiveQueries();
        await this.app.use(await createController());

        return this.app;
    }

    private configMiddelwares(): void {
        this.app.use(express.json());
        this.app.use(Session.middleware);
        this.app.use((req, res, next) => {
            let r: string = req.get('Referer');
            if (r && r.includes('/api/proxy/url/') && !req.originalUrl.includes('/api/proxy/')) {
                r = r.replace('http://' + req.get('Host') + '/api/proxy/url/', '');
                r = decodeURIComponent(r);
                if (r) {
                    try {
                        const p = new url.URL(r);
                        const u = 'http://' + req.get('Host') + '/api/proxy/file/' +
                        encodeURIComponent(p.protocol + '//' + p.hostname + req.originalUrl);
                        console.log(u);
                        return res.redirect(301, u);
                    } catch (error) {
                        console.log('err', r);
                    }
                }
                // return res.redirect(301, url);
            }
            // Don't allow user to hit Heroku now that we have a domain
            // var host = req.get('Host');
            // if (host === 'serviceworker-cookbook.herokuapp.com') {
            //   return res.redirect(301, 'https://serviceworke.rs/' + req.originalUrl);
            // }
            return next();
        });
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
        // const c = new Company();
        // await this.lq.subscribe(c);
        // this.lq.on(c, (data: any) => {
        // });
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

}

const app = new App();
export { app };
export default async function server(): Promise<any> {
    return await app.initialize();
}
