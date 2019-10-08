import { verify, sign, SignOptions, decode } from 'jsonwebtoken';
import { promisify } from 'util';
import { User } from '../models/user';
import { app } from '../server';
import Session from './session';
import crypto from 'crypto';


export class  Auth {
    private secret = 'dupasecret';
    private expireTime = '24h';

    private verifyAsync: (key: string, secret: string) => Promise<any>;
    private signAsync: (payload: any, secret: string, options?: SignOptions) => Promise<string>;

    public async sign(user: User): Promise<string> {
        this.signAsync = promisify(sign);
        const jti = crypto.createHash('md5').update(user.name).digest('hex');
        const h = await this.signAsync({login: user.name, jti}, this.secret, {
            expiresIn: this.expireTime
        });
        const decoded: any = decode(h);
        if (decoded.exp) {
            await app.cache.set(jti, 'true', 'EX', Math.floor(decoded.exp - Date.now() / 1000));
        } else {
            await app.cache.set(jti, 'true');
        }
        return h;
    }

    public async verify(token: string): Promise<any> {
        this.verifyAsync =  promisify(verify);
        try {
            const decoded: any = await this.verifyAsync(token, this.secret);
            if (!decoded.jti || !app.cache.get(decoded.jti)) {
                return null;
            }
            return decoded;
        } catch (error) {
            return null;
        }

    }

    public async destroy(user: User): Promise<any> {
        const jti = crypto.createHash('md5').update(user.name).digest('hex');
        return await app.cache.del(jti);
    }
}


export class AuthMiddleware {
    public static checkToken = (req: any, res: any, next: any) => {
        let token = req.headers['x-access-token'] || req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        if (token) {
            const a = new Auth();
            a.verify(token).then((ret) => {
                if (ret) {
                    Session.set('user', ret);
                    req.decoded = ret;
                    next();
                } else {
                    return res.json({
                        success: false,
                        message: 'Token is not valid'
                    });
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    }
}
