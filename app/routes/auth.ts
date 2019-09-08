import jwt from 'express-jwt';

const getTokenFromHeaders = (req: any) => {
    const { headers: { authorization } } = req;

    if (authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1];
    }
    return null;
};

export const auth = {
    optional: jwt({
        credentialsRequired: false,
        getToken: getTokenFromHeaders,
        secret: 'secret',
        userProperty: 'payload'
    }),
    required: jwt({
        getToken: getTokenFromHeaders,
        secret: 'secret',
        userProperty: 'payload'
        ,
    })
};
