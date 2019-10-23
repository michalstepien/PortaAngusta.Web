import redis from 'redis';
import { promisify } from 'util';

class Cache {

    private client: redis.RedisClient;
    private getC: (key: string) => Promise<any>;
    private setC: (key: string, value: any, mode?: string, duration?: number) => Promise<any>;
    private delC: (key: string) => Promise<any>;
    private getCKeys: (pattern: string) => Promise<any>;
    private getCValues: (keys: Array<string>) => Promise<any>;
    private flushC: () => Promise<any>;

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

    public async set(key: string, value: any, mode?: string, duration?: number): Promise<any> {
        const args: Array<any> = [ key ];
        if (this.checkPrimitive(value)) {
            args.push(value);
        } else {
            args.push(JSON.stringify(value));
        }
        if (mode && duration) {
            args.push(mode);
            args.push(duration);
        }
        return this.setC.apply(this, args);

    }

    public async del(key: string): Promise<any> {
        const p = await this.delC(key);
        return p;
    }

    public async getRawValues(): Promise<any> {
       const keys = await this.getCKeys('*');
       const values = await this.getCValues(keys);
       return values;
    }

    public async flushDB(): Promise<boolean> {
        return await this.flushC();
     }


    public init() {
        try {
            this.client = redis.createClient({ host: '0.0.0.0' });
            this.client.on('error', (err) => {
                console.log('Error ' + err);
            });
            this.getC = promisify(this.client.get).bind(this.client);
            this.setC = promisify(this.client.set).bind(this.client);
            this.delC = promisify(this.client.del).bind(this.client);
            this.exists = promisify(this.client.exists).bind(this.client);
            this.getCKeys = promisify(this.client.keys).bind(this.client);
            this.getCValues = promisify(this.client.mget).bind(this.client);
            this.flushC = promisify(this.client.flushall).bind(this.client);
        } catch (error) {
            console.error(error);
        }
    }
}

const cache = new Cache();
cache.init();

export default cache;
