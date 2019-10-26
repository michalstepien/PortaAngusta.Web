import { Base, dbProperty, ModelClass, dbTypes } from './base';

@ModelClass('SearchSettings')
export class SearchSettings extends Base<SearchSettings> {


    @dbProperty(null, dbTypes.EmbeddedList, 'string')
    public keywords: Unpacked<string[]>  = [];

    @dbProperty(null, dbTypes.EmbeddedList, 'string')
    public searchEngines: Unpacked<string[]>  = [];

    @dbProperty(null, dbTypes.EmbeddedList, 'short')
    public outputs: Unpacked<number[]>  = [];

    @dbProperty()
    public numberPages = 1;

    constructor() {
        super(SearchSettings);
    }
}
