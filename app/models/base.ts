import 'reflect-metadata';
import connection from '../db';
import Cluster from '../clusters/base';
import Collection from '../core/linq';

const dbPropertyMetadataKey = Symbol('dbProperty');

export enum dbTypes {
    /**
     * Handles only the values True or False
     */
    Boolean = 0,
    /**
     * 32-bit signed Integers
     */
    Integer = 1,
    /**
     * Small 16-bit signed integers
     */
    Short = 2,
    Long = 3,
    Float = 4,
    Double = 5,
    Datetime = 6,
    String = 7,
    Binary = 8,
    Embedded = 9,
    EmbeddedList = 10,
    EmbeddedSet = 11,
    EmbeddedMap = 12,
    Link = 13,
    LinkList = 14,
    LinkSet = 15,
    LinkMap = 16,
    Byte = 17,
    Transient = 18,
    Date = 19,
    Custom = 20,
    Decimal = 21,
    LinkBag = 22,
    Any = 23
}

export function dbProperty(name: string = '', type: dbTypes = null, linkedClass: any = null) {
    return (c: any, key: string) => {
        const model = metadataModel.model[c.constructor.name] || {};
        if (name === '' || !name) { name = key; }
        if (!model.propertiesImport) { model.propertiesImport = {}; }
        if (!model.propertiesExport) { model.propertiesExport = {}; }
        model.propertiesImport[name] = { name: key, type, class: linkedClass };
        model.propertiesExport[key] = { name, type, class: linkedClass };

        metadataModel.model[c.constructor.name] = model;
    };
}

export const metadataModel: any = {
    model: {},
    dbAssociative: []
};

export function ModelClass(value: string) {
    return (constructor: any) => {
        const model = metadataModel.model[constructor.name] || {};
        model.dbClass = value;
        model.class = constructor;
        metadataModel.model[constructor.name] = model;
        metadataModel.dbAssociative[value] = constructor.name;
    };
}

export class Base<T> {

    constructor(type: any) {
        this.type = type;
        return new Proxy(this, {
            get(target: any, name, receiver) {
                const model = metadataModel.model[target.constructor.name];
                if (!model) { return Reflect.get(target, name, receiver); }
                if (!model.propertiesExport[name]) { return Reflect.get(target, name, receiver); }
                const ep = model.propertiesExport[name];
                if (ep.type === dbTypes.Link) {
                    const v = Reflect.get(target, name, receiver);
                    if (v && v.id && v._lz) {
                        const cls = ep.class;
                        const p: Base<typeof cls> = new ep.class();
                        p.id = v.id;
                        return p.load().then((d: any) => {
                            target[name] = p;
                            return Reflect.get(target, name, receiver);
                        });
                    } else {
                        return Reflect.get(target, name, receiver);
                    }
                } else if (ep.type === dbTypes.LinkList) {
                    const v: any[] = Reflect.get(target, name, receiver);
                    if (v && v.length > 0 && v[0]._lz) {
                        const cls = ep.class;
                        return target.loadProjection(ep.name, target.id).then((rPr: any) => {
                            const d = rPr[ep.name];
                            if (d.length === 0) {
                                target[name] = [];
                                return Reflect.get(target, name, receiver);
                            }
                            target[name] = [];
                            d.forEach((e: any) => {
                                const p: Base<typeof cls> = new ep.class();
                                p.importRecord(e);
                                target[name].push(p);
                            });
                            return Reflect.get(target, name, receiver);
                        });
                    } else {
                        return Reflect.get(target, name, receiver);
                    }
                } else if (ep.type === dbTypes.LinkSet) {
                    const v: Set<any> = Reflect.get(target, name, receiver);
                    if (v && v.size > 0 && v.values().next().value._lz) {
                        const cls = ep.class;
                        return target.loadProjection(ep.name, target.id).then((rPr: any) => {
                            const d = rPr[ep.name];
                            if (d.length === 0) {
                                target[name] = new Set<any>();
                                return Reflect.get(target, name, receiver);
                            }
                            target[name] = new Set<any>();
                            d.forEach((e: any) => {
                                const p: Base<typeof cls> = new ep.class();
                                p.importRecord(e);
                                target[name].add(p);
                            });
                            return Reflect.get(target, name, receiver);
                        });
                    } else {
                        return Reflect.get(target, name, receiver);
                    }
                } else if (ep.type === dbTypes.LinkMap) {
                    const v: Map<string, any> = Reflect.get(target, name, receiver);
                    if (v && v.size > 0 && v.values().next().value._lz && target.id) {
                        const cls = ep.class;
                        return target.loadProjectionMap(ep.name, target.id).then((d: any) => {
                            if (d.values.length === 0) {
                                target[name] = new Map<string, any>();
                                return Reflect.get(target, name, receiver);
                            }
                            target[name] = new Map<string, any>();
                            d.values.forEach((e: any, i: number) => {
                                const p: Base<typeof cls> = new ep.class();
                                p.importRecord(e);
                                target[name].set(d.keys[i], e);
                            });
                            return Reflect.get(target, name, receiver);
                        });
                    } else {
                        return Reflect.get(target, name, receiver);
                    }
                } else {
                    return Reflect.get(target, name, receiver);
                }
            }
        });
    }

    public type: any;

    public id: string;

    public static async  findById(id: string): Promise<any> {
        // TO DO: change to command
        const ses = await connection.ses();
        return ses.record.get('#' + id);
    }

    public static async  deleteById(id: string): Promise<any> {
        // TO DO: change to command
        const ses = await connection.ses();
        return ses.record.delete('#' + id);
    }

    public async loadAll(): Promise<T[]> {
        // TO DO: change to command
        // TO DO: add loadCluster
        const ses = await connection.ses();
        const cls = await ses.class.get(this.dbClass());
        const lst = await cls.list().all();
        const elements: T[] = [];
        lst.forEach((element: any) => {
            const a: any = new this.type();
            a.importRecord(element, true);
            elements.push(a);
        });
        ses.close();
        return elements;
    }

    public async save(cluster?: Cluster): Promise<T> {
        const ses = await connection.ses();
        try {
            const expR = this.exportRecord(this.constructor.name, null);
            const command = (!this.id ? 'INSERT INTO ' : 'UPDATE ');
            const where = (this.id ? ' WHERE @rid=' + this.id : '');
            const clstr = (cluster ? ' CLUSTER ' + cluster.name : '');
            const cmd = command + this.dbClass() + clstr + ' CONTENT ' + JSON.stringify(expR) + where;
            // cant save with params
            const saved = await ses.command(cmd).one();
            if (!this.id) {
                this.importRecord(saved);
            }
            ses.close();
            return saved;
        } catch (error) {
            console.error(error);
            return { error: false } as any;
        }

    }

    public async load(): Promise<T> {
        // TO DO: change to command
        // TO DO: dont throw No such record
        const ses = await connection.ses();
        const record = await ses.record.get('#' + this.id);
        ses.close();
        return this.importRecord(record);
    }

    public async  delete(): Promise<T> {
        // TO DO: change to command
        const ses = await connection.ses();
        const ret = ses.record.delete('#' + this.id);
        ses.close();
        return ret;
    }

    public async liveQuery() {
        const ses = await connection.ses();
        return ses.liveQuery('select from ' + this.dbClass());
    }

    public dbClass() {
        return metadataModel.model[this.constructor.name].dbClass;
    }

    public async traverseFromClass(): Promise<Array<Base<any>>> {
        const ses = await connection.ses();
        const tr = await ses.traverse().from(this.dbClass()).all();
        const ret: any = [];
        tr.forEach((el: any) => {
            ret.push(this.importAnyRecord(el));
        });
        ses.close();
        return ret;
    }

    public async traverseFromId(): Promise<Array<Base<any>>> {
        const ses = await connection.ses();
        const tr = await ses.traverse().from(this.id).all();
        const ret: any = [];
        tr.forEach((el: any) => {
            ret.push(this.importAnyRecord(el));
        });
        ses.close();
        return ret;
    }

    // private

    public importRecord(record: any) {
        const model = metadataModel.model[this.constructor.name];
        if (record['@rid']) {
            this.id = record['@rid'].cluster + ':' + record['@rid'].position;
        }
        if (record['@class'] !== model.dbClass) {
            throw new DbError('Cannot load db class:' + record['@class'] + ' to: ' + this.constructor.name + 'model');
        }
        const toImp = model.propertiesImport;
        const keysThis = Object.keys(toImp).filter((x: string) => x !== 'id');
        keysThis.forEach((k) => {
            if (this.hasOwnProperty(toImp[k].name)) {
                if (toImp[k].type === dbTypes.Link) {
                    if (record[k] && record[k].cluster) {
                        (this as any)[toImp[k].name] = { id: record[k].cluster + ':' + record[k].position, _lz: true };
                    } else {
                        (this as any)[toImp[k].name] = null;
                    }
                } else if (toImp[k].type === dbTypes.LinkList) {
                    const tmpArr: any = [];
                    if (record[k] && record[k].length > 0) {
                        record[k].forEach((r: any) => {
                            const lnk = { id: r.cluster + ':' + r.position, _lz: true };
                            tmpArr.push(lnk);
                        });
                    }
                    (this as any)[toImp[k].name] = tmpArr;
                } else if (toImp[k].type === dbTypes.LinkSet) {
                    const tmpSet = new Set();
                    if (record[k] && record[k].length > 0) {
                        record[k].forEach((r: any) => {
                            const lnk = { id: r.cluster + ':' + r.position, _lz: true };
                            tmpSet.add(lnk);
                        });
                    }
                    (this as any)[toImp[k].name] = tmpSet;
                } else if (toImp[k].type === dbTypes.LinkMap) {
                    const tmpMap = new Map<string, any>();
                    if (record[k]) {
                        const keysLinkMap = Object.keys(record[k]);
                        keysLinkMap.forEach((r: any) => {
                            const lnk = { id: record[k][r].cluster + ':' + record[k][r].position, _lz: true };
                            tmpMap.set(r, lnk);
                        });
                    }
                    (this as any)[toImp[k].name] = tmpMap;
                } else if (toImp[k].type === dbTypes.Embedded) {
                    if (record[k]) {
                        const ep = toImp[k];
                        const cls = ep.class;
                        const p: Base<typeof cls> = new ep.class();
                        p.importRecord(record[k]);
                        (this as any)[toImp[k].name] = p;
                    } else {
                        (this as any)[toImp[k].name] = null;
                    }

                } else {
                    (this as any)[toImp[k].name] = record[k];
                }
            }
        });
        return this as any;
    }

    public importAnyRecord(record: any): Base<any> {
        const cls = metadataModel.dbAssociative[record['@class']];
        if (!cls) {
            throw new DbError('Cannot load db class:' + record['@class'] + '. Create model to this class.');
        }
        const model = metadataModel.model[cls];
        const inst: Base<any> = new model.class();
        if (record['@rid']) {
            inst.id = record['@rid'].cluster + ':' + record['@rid'].position;
        }
        const toImp = model.propertiesImport;
        const keysThis = Object.keys(toImp).filter((x: string) => x !== 'id' && x !== 'type');
        keysThis.forEach((k) => {
            if (inst.hasOwnProperty(toImp[k])) {
                (inst as any)[toImp[k]] = record[k];
            }
        });
        return inst as Base<any>;
    }

    private parseID(id: string): any {
        const x = id.split(':');
        if (x.length > 0) {
            return { cluster: x[0], position: x[1] };
        }
        return null;
    }

    public exportRecord(className: string, record: any) {
        const model = metadataModel.model[className];
        const toExport = model.propertiesExport;
        const r: any = {};
        const keys = Object.keys(toExport).filter((x: string) => x !== 'id' && x !== 'type');
        const that: any = record || this;
        keys.forEach((k) => {
            if (toExport[k].type === dbTypes.Link) {
                if (that[k] && that[k].id) {
                    r[k] = { '@rid': this.parseID(that[k].id) };
                } else {
                    r[k] = null;
                }
            } else if (toExport[k].type === dbTypes.LinkList) {
                if (that[k]) {
                    r[k] = that[k].map((e: any) => ({'@rid': '#' + e.id}));
                } else {
                    r[k] = [];
                }
            } else if (toExport[k].type === dbTypes.LinkSet) {
                if (that[k]) {
                    r[k] = [...that[k]].map((e: any) => ({'@rid': '#' + e.id}));
                } else {
                    r[k] = [];
                }
            } else if (toExport[k].type === dbTypes.LinkMap) {
                if (that[k]) {
                    const p: any = {};
                    that[k].forEach((val: any, key: any) => {
                        p[key] = {'@rid': '#' + val.id };
                    });
                    r[k] = p;
                } else {
                    r[k] = {};
                }
            } else if (toExport[k].type === dbTypes.Embedded) {
                if (that[k]) {
                    const m = new toExport[k].class();
                    r[k] = this.exportRecord(m.dbClass(), that[k]);
                } else {
                    that[k] = {};
                }
            } else {
                r[k] = that[k];
            }
        });
        return r;
    }

    private async loadProjection(name: string, id: string): Promise<any> {
        const ses = await connection.ses();
        const ret = await ses.select(name + ':{@rid,@class,*}').from('#' + id).one();
        ses.close();
        return ret;
    }

    private async loadProjectionMap(name: string, id: string): Promise<any> {
        const ses = await connection.ses();
        const retName = name + '.keys()';
        const mapKeys = await ses.select(retName).from('#' + id).one();
        const s = name + '[' + mapKeys[retName].map((x: string) => '"' + x + '"').join(',') + ']';
        const ret = await ses.select(s + ':{@rid,@class,*}').from('#' + id).one();
        ses.close();
        return { keys: mapKeys[retName] || [], values: ret[s] || [] };
    }

    public collection(): Collection<T> {
        return new Collection<T>(this.dbClass(), async (cmd: string, projection: boolean) => {
            console.log(cmd);
            const ses = await connection.ses();
            const qret = await ses.command(cmd).all();
            ses.close();
            if (projection) {
                return qret;
            } else {
                const elements: T[] = [];
                qret.forEach((element: any) => {
                    const a: any = new this.type();
                    a.importRecord(element, true);
                    elements.push(a);
                });
                return elements;
            }
        });
    }
}


export class DbError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, DbError.prototype);
    }

    public format() {
        return { message: this.message, stack: this.stack, name: this.name };
    }
}
