import { Base, dbProperty, ModelClass } from './base';

@ModelClass('LogDate')
export class LogDate<T> extends Base<T> {

    @dbProperty()
    public createDate: Date = null;

    @dbProperty()
    public updateDate: Date = null;

    constructor(cls: any) {
        super(cls);
    }
}
