import "reflect-metadata";
import connection from "../db";

const dbPropertyMetadataKey = Symbol("dbProperty");

function dbProperty(name: string) {
    return Reflect.metadata(dbPropertyMetadataKey, name);
}

export const metadataModel: any = {
    model: {}
};

export function ModelClass(value: string) {
    return (constructor: Function) => {
        const model = metadataModel.model[constructor.name] || {};
        model.dbClass = value;
        model.class = constructor;
        metadataModel.model[constructor.name] = model;
    };
}

class Base<T> {

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
            const saved =  await cls.create(this.exportRecord());
            connection.close();
            return saved;
        } catch (error) {
            return { error: false} as any;
        }

    }

    public async load(): Promise<T> {
        const ses = await connection.ses();
        const record = await ses.record.get("#" + this.id);
        return this.importRecord(record, true);
    }

    public async  delete(): Promise<T> {
        const ses = await connection.ses();
        return ses.record.delete("#" + this.id);
    }

    public async  update(): Promise<T> {
        const ses = await connection.ses();
        return ses.record.delete("#" + this.id);
    }

    // private

    public importRecord(record: any, fromDB: boolean = false) {
        if (record["@rid"]) {
            this.id = record["@rid"].cluster + ":" + record["@rid"].position;
        }
        const refMtd: any = {};
        const keysThis = Object.keys(this).filter((x: string) => x !== "id");
        keysThis.forEach((k) => {
            const pr = Reflect.getMetadata(dbPropertyMetadataKey, this, k);
            if (pr) {
                refMtd[pr] = k;
            }
        });
        const keys = Object.keys(record).filter((x: string) => x !== "id");

        keys.forEach((k) => {
            const pr = refMtd[k];

            if (pr && fromDB) {
                (this as any)[pr] = record[k];
            } else {
                if (this.hasOwnProperty(k)) {
                    (this as any)[k] = record[k];
                }
            }
        });
        return this as any;
    }

    public exportRecord(insert: boolean = true) {
        const r: any = { };
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

export  { Base, dbProperty };
