const OrientDBClient = require('orientjs').OrientDBClient;
import dotenv from 'dotenv';
import Session from '../core/session';

dotenv.config();

const port = process.env.DB_PORT;
const host = process.env.DB_HOST;
const name = process.env.DB_NAME;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

class OrientConnection {
    private client: any;
    private pool: any = {};
    private session: any = {};

    public async connect(): Promise<any> {
        return await OrientDBClient.connect({
            host,
            port // , logger : { debug : console.log.bind(console,  '\x1b[34m', '[ORIENTDB]')}
        });
    }

    public async init(): Promise<any> {
        console.log('INIT connection');
        try {
            this.client = await this.connect();
            this.pool.root = await this.client.sessions({ name, username, password });

        } catch (error) {
            console.error(error);
        }
    }

    public async initUser(usernameI: string, passwordI: string): Promise<any> {
        console.log('INIT connection USER: ' + usernameI);
        try {
            this.pool[usernameI] = await this.client.sessions({ name,  username: usernameI, password: passwordI });
        } catch (error) {
            console.error(error);
        }

    }

    public async ses(): Promise<any> {
        const usr = Session.get('user');
        if ( usr && usr.login && this.pool[usr.login] ) {
            this.session[usr.login] = await this.pool[usr.login].acquire();
            return this.session[usr.login];
        } else {
            this.session.root = await this.pool.root.acquire();
            return this.session.root;
        }
    }

    public async close(): Promise<any> {
        this.session.root.close();
    }
}

const connection = new OrientConnection();

export default connection;
