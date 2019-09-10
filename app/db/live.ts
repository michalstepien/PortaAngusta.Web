
import { Base } from '../models/base';

const liveQueryEvents: any = {
    model: {}
};

export default class LiveQueries {

    public async subscribe(model: Base<any>) {
        if (!liveQueryEvents.model[model.dbClass()]) {
            liveQueryEvents.model[model.dbClass()] = await model.liveQuery();
        }
    }

    public on(model: Base<any>, callback: (d: any) => void) {
        liveQueryEvents.model[model.dbClass()].on('data', (data: any) => {
            callback(data);
        });
    }

    public async unsubscribe(model: Base<any>) {
        if (liveQueryEvents.model[model.dbClass()]) {
            liveQueryEvents.model[model.dbClass()].unsubscribe();
        }
    }

    public async unsubscribeAll() {
        const keys = Object.keys(liveQueryEvents.model);
        keys.forEach((k) => {
            liveQueryEvents.model[k].unsubscribe();
        });
    }

}
