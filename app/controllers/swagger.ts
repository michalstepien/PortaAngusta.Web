import { BaseController, Controller, Get, metadata } from './base';
import { Base } from '../models/base';
import { pathToFileURL } from 'url';
import { stringLiteral } from '@babel/types';

@Controller('swagger-api')
export class SwaggerApiController extends BaseController {

    @Get('docs')
    public async getDocs() {
        const api: any = {
            openapi: '3.0.0',
            info: {
                version: '1.0.0',
                title: 'Porta Angusta',
                description: 'Bla bla',
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT'
                }
            },
            paths: {},
            consumes: [
                'application/json'
            ],
            produces: [
                'application/json'
            ],
            definitions: {}
        };

        const keysControllers = Object.keys(metadata.controllers);
        keysControllers.forEach((controllerName: string) => {
            const controller = metadata.controllers[controllerName];
            const keysActions = Object.keys(controller.actions);

            keysActions.forEach((k) => {

                const action = controller.actions[k];
                const path = '/api/' + controller.path + '/' + this.normalizePathParams(action.path);

                let $ref = '';
                if (action.return) {
                    const a = new action.return.type() as Base<any>;
                    const array = Object.getOwnPropertyNames(a);
                    api.definitions[a.constructor.name] = {
                        properties: []
                    };
                    $ref = '#/definitions/' + a.constructor.name;
                }

                api.paths[path] = api.paths[path] || {};
                api.paths[path][action.verb] = api.paths[path][action.verb] || {};
                api.paths[path][action.verb].summary = action.description;
                api.paths[path][action.verb].parameters = [];

                if (action.params) {
                    action.params.forEach((p: any) => {
                        api.paths[path][action.verb].parameters.push({
                            name: p.name,
                            in: 'path',
                            description: 'How many items to return at one time (max 100)',
                            required: false,
                            type: 'string'
                        });
                    });
                }

                api.paths[path][action.verb].responses = {
                    200: {
                        description: '',
                        schema: null
                    }
                };
                if ($ref) {
                    api.paths[path][action.verb].responses['200'].schema = { $ref };
                }

            });
        });

        return api;
    }

    private normalizePathParams(path: string): string {
        if (path.indexOf(':') > -1) {
            const arrP = path.split('/');
            const arrPS: string[] = [];
            arrP.forEach((el: string) => {
                if (el.indexOf(':') > -1) {
                    el = '{' + el.replace(':', '') + '}';
                }
                arrPS.push(el);
            });
            return arrPS.join('/');
        }
        return path;
    }

}
