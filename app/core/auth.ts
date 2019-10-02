import { verify } from 'jsonwebtoken';

export default class AuthMiddleware {
    // https://medium.com/dev-bits/a-guide-for-adding-jwt-token-based-authentication-to-your-single-page-nodejs-applications-c403f7cf04f4
    public static checkToken = (req: any, res: any, next: any) => {
        let token = req.headers['x-access-token'] || req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        if (token) {
            verify(token, 'dupasecret', (err: any, decoded: any) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Token is not valid'
                    });
                } else {
                    req.decoded = decoded;
                    next();
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
