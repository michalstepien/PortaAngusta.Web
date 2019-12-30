import { Base, dbProperty, ModelClass, dbTypes } from './base';

@ModelClass('CrawlerSettings')
export class CrawlerSettings extends Base<CrawlerSettings> {

    @dbProperty()
    public crawlerType = CrawlerType.cheerio;

    @dbProperty()
    public deep = 0;

    @dbProperty()
    public startPage = '';

    @dbProperty()
    public sameSite = true;

    @dbProperty()
    public sameDomain = false;

    @dbProperty()
    public maxLinks = 0;

    @dbProperty()
    public maxLinksSite = 0;

    @dbProperty()
    public timeout = 0;

    constructor() {
        super(CrawlerSettings);
    }
}

export enum CrawlerType {
    cheerio = 0,
    puppeteer = 1
}
