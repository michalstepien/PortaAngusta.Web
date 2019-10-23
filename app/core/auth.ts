import { verify, sign, SignOptions, decode } from 'jsonwebtoken';
import { promisify } from 'util';
import { User } from '../models/user';
import cache from '../core/cache';
import crypto from 'crypto';


export class Auth {
    private secret = 'dupasecret';
    private expireTime = '24h';

    private verifyAsync: (key: string, secret: string) => Promise<any>;
    private signAsync: (payload: any, secret: string, options?: SignOptions) => Promise<string>;

    public async sign(user: User): Promise<string> {
        this.signAsync = promisify(sign);
        const jti = crypto.createHash('md5').update(user.name).digest('hex');
        const h = await this.signAsync({ login: user.name, jti }, this.secret, {
            expiresIn: this.expireTime
        });
        const decoded: any = decode(h);
        if (decoded.exp) {
            await cache.set(jti, 'true', 'EX', Math.floor(decoded.exp - Date.now() / 1000));
        } else {
            await cache.set(jti, 'true');
        }
        return h;
    }

    public async verify(token: string): Promise<any> {
        this.verifyAsync = promisify(verify);
        try {
            const decoded: any = await this.verifyAsync(token, this.secret);
            if (!decoded.jti || !cache.get(decoded.jti)) {
                return null;
            }
            return decoded;
        } catch (error) {
            return null;
        }

    }

    public async destroy(user: User): Promise<any> {
        const jti = crypto.createHash('md5').update(user.name).digest('hex');
        return await cache.del(jti);
    }
}



