import express from 'express';
import 'reflect-metadata';
import { Base } from '../models/base';
import * as babel from '@babel/parser';
import { Auth } from '../core/auth';
import Session from '../core/session';

export interface IResults {
    count: number;
    results: Array<any>;
}

export const metadata: any = {
    controllers: {}
};

export function Controller(value: string, value2: string = '') {
    return (constructor: any) => {
        const controller = metadata.controllers[constructor.name] || {};
        controller.path = value;
        controller.pathSingular = value2;
        controller.class = constructor;
        metadata.controllers[constructor.name] = controller;
    };
}

export function Post(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: 'post', methodName, path, object });
    };
}

export function Put(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: 'put', methodName, path, object });
    };
}


export function Get(path: string | RegExp) {
    return (object: any, methodName: string) => {
        if (methodName === 'getRecords') {
            console.log(object, object.constructor.name, 'ffff');
        }

        _addVerbFunctionMeta({ verb: 'get', methodName, path, object });
    };
}

export function Delete(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: 'delete', methodName, path, object });
    };
}

export function Description(description: string) {
    return (object: any, methodName: string) => {
        _addDescription({ object, methodName, description });
    };
}

export function Authorize(isAuth: boolean = true) {
    return (object: any, methodName: string) => {
        const controller = metadata.controllers[object.constructor.name] || {};
        controller.actions = controller.actions || {};
        controller.actions[methodName] = controller.actions[methodName] || {};
        controller.actions[methodName].auth = isAuth;
        metadata.controllers[object.constructor.name] = controller;
    };
}

export function Plain() {
    return (object: any, methodName: string) => {
        const controller = metadata.controllers[object.constructor.name] || {};
        controller.actions = controller.actions || {};
        controller.actions[methodName] = controller.actions[methodName] || {};
        controller.actions[methodName].plain = true;
        metadata.controllers[object.constructor.name] = controller;
    };
}


export function Return(type: any, list: boolean = false) {
    return (object: any, methodName: string) => {
        const controller = metadata.controllers[object.constructor.name] || {};
        controller.actions = controller.actions || {};
        controller.actions[methodName] = controller.actions[methodName] || {};
        controller.actions[methodName].return = { type, isList: list };
        metadata.controllers[object.constructor.name] = controller;
    };
}

//#region Route Params

export function Body(object: any, methodName: string, parameterIndex: number, ti: any = null) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].params = controller.actions[methodName].params || [];
    controller.actions[methodName].params.push({ type: ParamType.body, index: parameterIndex, typeInput: ti });
    metadata.controllers[object.constructor.name] = controller;
}

export function Query(object: any, methodName: string, parameterIndex: number, ti: any = null) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].params = controller.actions[methodName].params || [];
    controller.actions[methodName].params.push({ type: ParamType.query, index: parameterIndex, typeInput: ti });
    metadata.controllers[object.constructor.name] = controller;
}

export function Param(object: any, methodName: string, parameterIndex: number, ti: any = null, n: string = '', d: string = '') {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].params = controller.actions[methodName].params || [];
    controller.actions[methodName].params.push({ type: ParamType.param, index: parameterIndex, typeInput: ti, name: n, description: d});
    metadata.controllers[object.constructor.name] = controller;
}

export enum ParamType {
    param = 1,
    query = 2,
    body = 3
}
//#endregion





function _addVerbFunctionMeta({ verb, path, object, methodName }: any) {

    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    const argumentTypes = Reflect.getMetadata('design:paramtypes', object, methodName);

    controller.actions[methodName].verb = verb;
    controller.actions[methodName].path = path;

    controller.actions[methodName].params = controller.actions[methodName].params || [];

    controller.actions[methodName].target = object[methodName];
    const argumentsNames = getArguments(object[methodName]);
    if ( methodName === 'getRecord' ) {
        console.log(argumentTypes, argumentsNames);
    }

    controller.actions[methodName].params.forEach((p: any, index: number) => {
        if (typeof argumentTypes[index] !== 'undefined') {
            p.typeInput = argumentTypes[index];
        }
        if (typeof argumentsNames[index] !== 'undefined') {
            p.name = argumentsNames[index];
        }
    });
    metadata.controllers[object.constructor.name] = controller;
}

function getArguments(func: any): Array<any> {
    const maybe = (x: any) => {
        return x || {}; // optionals support
    };

    try {
        const ast = babel.parse('\n ' + func.toString().replace('async', 'async function') + '\n', { plugins: ['typescript'] });
        const program = ast.program;
        const body: any = program.body[0];
        const params = body.params;
        let ret: any[] = [];
        if (params) {
            ret = params.map((node: any) => {
                return node.name || maybe(node.left).name || '...' + maybe(node.argument).name;
            });
        }
        return ret;
    } catch (e) {
        return []; // could also return null
    }
}

function _addDescription({ object, methodName, description }: any) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].description = description;
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


export class BaseController {

    public metadata: any = {};

    static noop(): any {
        return null;
    }

    public generateRoutes(router: express.Router | any) {
        const controller = metadata.controllers[this.constructor.name];
        if (!controller || !controller.actions) {
            return;
        }
        const keys = Object.keys(controller.actions);

        keys.forEach((k) => {
            const action = controller.actions[k];
            const path = '/api/' + controller.path + '/' + action.path;
            let authMd = (req: any, res: any, next: any) => {
                next();
            };
            if (action.auth) {
                authMd = AuthMiddleware.checkToken;
            }

            if (action.plain) {
                router[action.verb](path, authMd, (req: any, res: any) => {
                    const p: any = this;
                    try {

                        return p[k].apply(this, [req, res]);
                    } catch (error) {
                        console.error(error);
                        return res.send({ error: true, details: error.stack });
                    }
                });
            } else {
                router[action.verb](path, authMd, async (req: any, res: any) => {
                    const p: any = this;
                    const fPrams: any = [];
                    if (action.params) {
                        action.params.forEach((mp: any) => {
                            if (action.verb === 'get' || action.verb === 'delete') {
                                if (mp.type === 2) {
                                    const val = req.query[mp.name];
                                    fPrams.push(val);
                                } else {
                                    // TO DO
                                    const val = req.params[mp.name];
                                    // if (val !== undefined && val !== null) {
                                    //     if (mp.type === 'number') {
                                    //         val = Number(val);
                                    //     } else if (mp.type === 'Date') {
                                    //         val = new Date(val);
                                    //     }
                                    // }
                                    fPrams.push(val);
                                }
                            } else if (action.verb === 'post' || action.verb === 'put') {
                                fPrams.push(req.body[mp.name]);
                            }
                        });
                    }
                    try {
                        const ret = await p[k].apply(this, fPrams);
                        return res.send(ret);
                    } catch (error) {
                        console.error(error);
                        return res.send({ error: true, details: error.stack });
                    }

                });

            }
        });
    }
}

// tslint:disable-next-line:max-classes-per-file
export class BaseControllerOf<T> extends BaseController {
    public metadata: any = {};
    public model: Base<T>;
    constructor() {
        super();
        _addVerbFunctionMeta({ verb: 'get', methodName: 'getRecord', path: 'record/:id', object: this});
        Param(this, 'getRecord', 0, 'string', 'id', 'id of record');
        _addVerbFunctionMeta({ verb: 'get', methodName: 'getRecords', path: 'records', object: this });
        _addVerbFunctionMeta({ verb: 'delete', path: 'record/:id', object: this, methodName: 'deleteRecord' });
        Param(this, 'deleteRecord', 0, 'string', 'id', 'id of record');
        _addVerbFunctionMeta({ verb: 'post', path: 'record', object: this, methodName: 'createRecord' });
    }

    public async getRecord(id: string) {
        this.model.id = id;
        return await this.model.load();
    }

    public async getRecords() {
        const ret = await this.model.collection().execute();
        return ret;
    }

    public async deleteRecord(id: string) {
        this.model.id = id;
        await this.model.delete();
        return  {ok: true};
    }

    public async createRecord(m: Base<T>) {
        this.model.importRecord(m);
        console.log(m);

    }

}

