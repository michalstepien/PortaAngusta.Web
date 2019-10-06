import redis from 'redis';
import { promisify } from 'util';

export default class Cache {

    private client: redis.RedisClient;
    private getC: (key: string) => Promise<any>;
    private setC: (key: string, value: any) => Promise<any>;

    public exists: (key: string) => Promise<boolean>;

    private checkPrimitive(value: any): boolean {
        return (value !== Object(value));
    }


    public async get(key: string): Promise<any> {
        const p = await this.getC(key);
        try {
            return JSON.parse(p);
        } catch (error) {
            return p;
        }
    }

    public async set(key: string, value: any): Promise<any> {
        if (this.checkPrimitive(value)) {
            return this.setC(key, value);
        } else {
            return this.setC(key, JSON.stringify(value));
        }
    }

    public init() {
        try {
            this.client = redis.createClient({ host: '0.0.0.0' });
            this.client.on('error', (err) => {
                console.log('Error ' + err);
            });
            this.getC = promisify(this.client.get).bind(this.client);
            this.setC = promisify(this.client.set).bind(this.client);
            this.exists = promisify(this.client.exists).bind(this.client);
        } catch (error) {
            console.error(error);
        }
    }
}
