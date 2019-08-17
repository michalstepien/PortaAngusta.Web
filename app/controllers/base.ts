import express from "express";
import "reflect-metadata";

export const metadata: any = {
    controllers: {}
};

export function Controller(value: string) {
    return (constructor: Function) => {
        const controller = metadata.controllers[constructor.name] || {};
        controller.path = value;
        controller.class = constructor;
        metadata.controllers[constructor.name] = controller;
    };
}

export function Post(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: "post", methodName, path, object });
    };
}

export function Put(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: "put", methodName, path, object });
    };
}

export function Get(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: "get", methodName, path, object });
    };
}

export function Delete(path: string | RegExp) {
    return (object: any, methodName: string) => {
        _addVerbFunctionMeta({ verb: "delete", methodName, path, object });
    };
}

function _addVerbFunctionMeta({ verb, path, object, methodName, }: any) {
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    const argumentTypes = Reflect.getMetadata("design:paramtypes", object, methodName);

    controller.actions[methodName].verb = verb;
    controller.actions[methodName].path = path;

    // remove
    controller.actions[methodName].target = object[methodName];
    controller.actions[methodName].argumentTypes = argumentTypes;

    metadata.controllers[object.constructor.name] = controller;
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export class BaseController {

    public metadata: any = {};

    public generateRoutes(router: express.Router | any) {
        const controller = metadata.controllers[this.constructor.name];
        const keys = Object.keys(controller.actions);
        keys.forEach((k) => {
            const action = controller.actions[k];
            const path = "/api/" + controller.path + "/" + action.path;
            router[action.verb](path, async (req: any, res: any) => {
                const fPrams: any = [];
                const p: any = this;
                this.metadata[k].params.forEach((mp: any) => {
                    if (action.verb === "get" || action.verb === "delete") {
                        let val = req.params[mp.name];
                        if (val !== undefined && val !== null) {
                            if (mp.type === "number") {
                                val = Number(val);
                            } else if (mp.type === "Date") {
                                val = new Date(val);
                            }
                        }
                        fPrams.push(val);
                    } else if (action.verb === "post" || action.verb === "put") {
                        console.log(req);
                        console.log(req.body);
                        const val = req.body[mp.name];
                        fPrams.push(val);
                    }
                });
                const ret = await p[k].apply(undefined, fPrams);
                res.send(ret);
            });
        });
        // console.log(this.constructor.name);
        // console.log(metadata.controllers[this.constructor.name]);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class BaseControllerOf<T> extends BaseController {

    public generateRoutes() {
        console.log(this.constructor.name);
        console.log(metadata.controllers[this.constructor.name]);
    }
}
