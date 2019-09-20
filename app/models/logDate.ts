import { Base, dbProperty, ModelClass } from './base';
import Cluster from '../clusters/base';

@ModelClass('LogDate')
export class LogDate<T> extends Base<T> {

    @dbProperty()
    public createDate: Date = null;

    @dbProperty()
    public updateDate: Date = null;

    constructor(cls: any) {
        super(cls);
    }

    public save(cluster?: Cluster): Promise<T> {
        if (this.id) {
            this.updateDate = new Date();
        } else {
            this.createDate = new Date();
        }
        return super.save(cluster);
    }
}
