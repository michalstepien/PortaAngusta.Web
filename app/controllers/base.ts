import express from 'express';
import 'reflect-metadata';
import { Base } from '../models/base';
import * as babel from '@babel/parser';
import AuthMiddleware from '../core/auth';

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

export function Auth(isAuth: boolean = true) {
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

export function Required(object: any, methodName: string, parameterIndex: number) {
    // console.log(object, methodName, parameterIndex);
}

export function Query(object: any, methodName: string, parameterIndex: number) {
    // console.log(object, methodName, parameterIndex);
}

export function Param(object: any, methodName: string, parameterIndex: number) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].params = controller.actions[methodName].params || [];
    controller.actions[methodName].params.push({ type: 1, index: parameterIndex, typeInput: null });
    metadata.controllers[object.constructor.name] = controller;
}

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
        console.log(e);
        return []; // could also return null
    }
}

function _addDescription({ object, methodName, description }: any) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};
    controller.actions[methodName].description = description;
}

export class BaseController {

    public metadata: any = {};

    public generateRoutes(router: express.Router | any) {
        const controller = metadata.controllers[this.constructor.name];

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
                                let val = req.params[mp.name];
                                if (val !== undefined && val !== null) {
                                    if (mp.type === 'number') {
                                        val = Number(val);
                                    } else if (mp.type === 'Date') {
                                        val = new Date(val);
                                    }
                                }
                                fPrams.push(val);
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
        const controller = metadata.controllers[this.constructor.name];
        _addVerbFunctionMeta({ verb: 'get', path: controller.pathSingular + '/:id', object: this, methodName: 'getRecord' });
        _addVerbFunctionMeta({ verb: 'get', path: 'all', object: this, methodName: 'getRecords' });
    }

    public async getRecord(id: string) {
        this.model.id = id;
        return await this.model.load();
    }

    public async getRecords() {
        const ret = await this.model.loadAll();
        return ret;
    }

    // public deleteRecord(id: string) {

    // }

    // public createRecord() {

    // }

    // public updateRecord() {

    // }

}
