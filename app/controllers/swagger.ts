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
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            definitions: {}
        };

        const keysControllers = Object.keys(metadata.controllers);
        keysControllers.forEach((controllerName: string) => {
            const controller = metadata.controllers[controllerName];
            if (!controller || !controller.actions) {
                return;
            }

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
                api.paths[path][action.verb].security = [
                    { bearerAuth: [] }
                ];
                api.paths[path][action.verb].parameters = [];
                if (action.path === 'auth') {
                    api.paths[path][action.verb].requestBody = {
                        content: {
                          'application/json': {
                            schema: {
                                properties: {
                                    username: {
                                        type: 'string',
                                        example: 'admin'
                                    },
                                    password: {
                                        type: 'string',
                                        example: 'password'
                                    }
                                }
                            }
                          }
                        },
                        description: 'order placed for purchasing the pet'
                      };
                }

                if (action.params) {
                    action.params.forEach((p: any) => {
                        if (p.type === 1) {
                            api.paths[path][action.verb].parameters.push({
                                name: p.name,
                                in: 'path',
                                description: 'How many items to return at one time (max 100)',
                                required: false,
                                type: 'string'
                            });
                        } else if (p.type === 2) {

                        } else if (p.type === 3) {
                            if (!api.paths[path][action.verb].requestBody) {
                                api.paths[path][action.verb].requestBody = {
                                    content: {
                                      'application/json': {
                                        schema: {
                                            properties: {
                                                username: {
                                                    type: 'string',
                                                    example: 'admin'
                                                },
                                                password: {
                                                    type: 'string',
                                                    example: 'password'
                                                }
                                            }
                                        }
                                      }
                                    },
                                    description: 'som description'
                                  };
                            }
                            console.log(p);
                            api.paths[path][action.verb].requestBody.content['application/json'].schema.properties[p.name] = {
                                type: 'string',
                                example: 'dupa'
                            };
                        }
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
