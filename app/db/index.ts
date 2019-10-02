const OrientDBClient = require('orientjs').OrientDBClient;
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.DB_PORT;
const host = process.env.DB_HOST;
const name = process.env.DB_NAME;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

class OrientConnection {
    private client: any;
    private pool: any = {};
    private session: any;

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

    public async ses(): Promise<any> {
        this.session = await this.pool.root.acquire();
        return this.session;
    }

    public async close(): Promise<any> {
        this.session.close();
    }
}

const connection = new OrientConnection();

export default connection;
