import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import connection from './db';
import LiveQueries from './db/live';
import {Company} from './models/company';
import createController from './routes';
import Cache from './core/cache';
import Session from './core/session';
import process from 'process';

dotenv.config();

class App {
    public app: express.Application;
    private port = process.env.SERVER_HTTP_PORT;
    private lq: LiveQueries = null;
    public cache: Cache;

    constructor() {
        this.app = express();
        this.configMiddelwares();
    }

    public async initialize(): Promise<any> {
        this.onExit();
        await this.initDB();
        this.initCache();
        this.app.use(await createController());
        await this.app.listen(this.port);
        console.log('\x1b[36m%s\x1b[0m', `SERVER STARTED at http://localhost:${this.port}`);

        this.configSwagger();
        await this.configLiveQueries();

        return this.app;
    }

    private configMiddelwares(): void {
        this.app.use(express.json());
        this.app.use(Session.middleware);
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

    private initCache() {
        try {
            this.cache = new Cache();
            this.cache.init();
        } catch (e) {
            console.error(e);
        }
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
