import * as puppeteer from 'puppeteer';
import { Crawler, ICrawlerOptions } from './crawler';
import url, { URL, UrlWithStringQuery } from 'url';

export class PuppeteerCrawler extends Crawler {

    constructor(public urlA: string, public options: ICrawlerOptions) {
        super(urlA, options);
    }

    public async load(): Promise<Array<string>> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(this.urlA, { waitUntil: 'networkidle2' });
        const items: Array<string> = [];
        await page.$$eval('a', (es) => {
            es.forEach(el => {
                let src = el.getAttribute('href');
                if (src) {
                    src = src.replace(/#.*$/, '');
                    if (src) {
                        const ret = super.getLink(src, this.urlA);
                        if (ret.url && !ret.error) {
                            items.push(ret.url);
                        } else {
                            if (ret.exit) {
                                return false;
                            }
                            if (ret.next) {
                                return true;
                            }
                        }
                    }
                }
            });
        });
        browser.close();
        return items;
    }


}
