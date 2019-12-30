import { Crawler, ICrawlerOptions } from './crawler';
import url, { UrlWithStringQuery } from 'url';
import got from 'got';
import cheerio from 'cheerio';
import normalizeUrl from 'normalize-url';

export class CheerioCrawler extends Crawler {

    constructor(public urlA: string, public options: ICrawlerOptions) {
        super(urlA, options);
    }

    public async load(): Promise<Array<string>> {

        const x = await got(this.urlA, { rejectUnauthorized: false, encoding: null });
        const urlArr: Array<string> = [];

        if (x.headers['content-type'].startsWith('text/html')) {
            const html: string = x.body;
            const $ = cheerio.load(html);
            const urlTmp = x.url;
            console.log('Parsing:', this.urlA);
            $('a').each((i, e) => {
                let src = $(e).attr('href');
                if (src) {
                    src = src.replace(/#.*$/, '');
                    if (src) {
                        const ret = super.getLink(src, urlTmp);
                        if (ret.url && !ret.error) {
                            urlArr.push(ret.url);
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
        }
        return urlArr;
    }


}
