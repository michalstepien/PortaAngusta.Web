import "reflect-metadata";
import connection from "../db";

const dbPropertyMetadataKey = Symbol("dbProperty");

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

export function dbProperty(name: string = "", type: dbTypes = null, linkedClass: any = null) {
    return (c: any, key: string) => {
        const model = metadataModel.model[c.constructor.name] || {};
        if (name === "" || !name) { name = key; }
        if (!model.propertiesImport) { model.propertiesImport = {}; }
        if (!model.propertiesExport) { model.propertiesExport = {}; }
        model.propertiesImport[name] = { name: key, type, class: linkedClass } ;
        model.propertiesExport[key] = { name, type, class: linkedClass };

        metadataModel.model[c.constructor.name] = model;
    };
}

export const metadataModel: any = {
    model: {},
    dbAssociative: []
};

export function ModelClass(value: string) {
    return (constructor: Function) => {
        const model = metadataModel.model[constructor.name] || {};
        model.dbClass = value;
        model.class = constructor;
        metadataModel.model[constructor.name] = model;
        metadataModel.dbAssociative[value] = constructor.name;
    };
}

export class Base<T> {

    public static async  findById(id: string): Promise<any> {
        const ses = await connection.ses();
        return ses.record.get("#" + id);
    }

    public static async  deleteById(id: string): Promise<any> {
        const ses = await connection.ses();
        return ses.record.delete("#" + id);
    }

    public type: any;

    public id: string;

    constructor(type: any) {
        this.type = type;
        return new Proxy(this, {
            get(target: any, name, receiver) {
                const model = metadataModel.model[target.constructor.name];
                if (!model) { return Reflect.get(target, name, receiver); }
                if (!model.propertiesExport[name]) { return Reflect.get(target, name, receiver); }
                if (model.propertiesExport[name].type === dbTypes.Link) {
                    const v = Reflect.get(target, name, receiver);
                    if (v && v.id && v._lz) {
                        const cls = model.propertiesExport[name].class;
                        const p: Base<typeof cls> = new  model.propertiesExport[name].class();
                        p.id = v.id;
                        return p.load().then((d: any) => {
                            target[name] = p;
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

    public async loadAll(): Promise<T[]> {
        const ses = await connection.ses();
        const cls = await ses.class.get(metadataModel.model[this.constructor.name].dbClass);
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

    public async save(): Promise<T> {
        const ses = await connection.ses();
        const cls = await ses.class.get(metadataModel.model[this.constructor.name].dbClass);
        try {
            const saved = await cls.create(this.exportRecord());
            ses.close();
            return saved;
        } catch (error) {
            return { error: false } as any;
        }

    }

    public async load(): Promise<T> {
        const ses = await connection.ses();
        const record = await ses.record.get("#" + this.id);
        ses.close();
        return this.importRecord(record, true);
    }

    public async  delete(): Promise<T> {
        const ses = await connection.ses();
        const ret = ses.record.delete("#" + this.id);
        ses.close();
        return ret;
    }

    public async  update(): Promise<T> {
        const ses = await connection.ses();
        const ret = ses.record.delete("#" + this.id);
        ses.close();
        return ret;
    }

    public async traverseFromClass(): Promise<Array<Base<any>>> {
        const ses = await connection.ses();
        const tr = await ses.traverse().from(metadataModel.model[this.constructor.name].dbClass).all();
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

    public importRecord(record: any, fromDB: boolean = false) {
        const model = metadataModel.model[this.constructor.name];
        if (record["@rid"]) {
            this.id = record["@rid"].cluster + ":" + record["@rid"].position;
        }
        if (record["@class"] !== model.dbClass) {
            throw new DbError("Cannot load db class:" + record["@class"] + " to: " + this.constructor.name + "model");
        }
        const toImp = model.propertiesImport;
        const keysThis = Object.keys(toImp).filter((x: string) => x !== "id");
        keysThis.forEach((k) => {
            if (this.hasOwnProperty(toImp[k].name)) {
                if (toImp[k].type === dbTypes.Link) {

                    if (record[k] && record[k].cluster) {
                        (this as any)[toImp[k].name] = {id: record[k].cluster + ":" + record[k].position, _lz: true };
                    }
                } else {
                    (this as any)[toImp[k].name] = record[k];
                }
            }
        });
        return this as any;
    }

    public importAnyRecord(record: any): Base<any> {
        const cls = metadataModel.dbAssociative[record["@class"]];
        if (!cls) {
            throw new DbError("Cannot load db class:" + record["@class"] + ". Create model to this class.");
        }
        const model = metadataModel.model[cls];
        const inst: Base<any> = new model.class();
        if (record["@rid"]) {
            inst.id = record["@rid"].cluster + ":" + record["@rid"].position;
        }
        const toImp = model.propertiesImport;
        const keysThis = Object.keys(toImp).filter((x: string) => x !== "id");
        keysThis.forEach((k) => {
            if (inst.hasOwnProperty(toImp[k])) {
                (inst as any)[toImp[k]] = record[k];
            }
        });
        return inst as Base<any>;
    }

    public exportRecord(insert: boolean = true) {
        const r: any = {};
        const keys = Object.keys(this).filter((x: string) => x !== "id");
        const that: any = this;
        keys.forEach((k) => {
            const pr = Reflect.getMetadata(dbPropertyMetadataKey, this, k);
            if (pr) {
                r[pr] = that[k];
            } else {
                r[k] = that[k];
            }
        });
        return r;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class DbError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, DbError.prototype);
    }

    public format() {
        return { message: this.message, stack: this.stack, name: this.name };
    }
}
