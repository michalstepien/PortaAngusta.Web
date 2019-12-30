import url, { UrlWithStringQuery } from 'url';
export abstract class Crawler {

    linksCounter = 0;

    constructor(public urlA: string, public options: ICrawlerOptions) {

    }

    public getLink(src: string, urlTmp: string): ICrawlerReturn {
        let hrefTmp: UrlWithStringQuery = null;
        try {
            if (src.startsWith('http')) {
                hrefTmp = url.parse(src);
            } else {
                hrefTmp = url.parse(url.resolve(urlTmp, src));
            }
            if (hrefTmp) {
                if (this.options.sameSite && hrefTmp.host !== this.options.baseUrl) {
                    return { url: hrefTmp.href, error: true, exit: false, next: true };
                }
                this.linksCounter = this.linksCounter + 1;
                if (this.options.maxLinksSite && this.linksCounter + 1 > this.options.maxLinksSite) {
                    return { url: hrefTmp.href, error: true, exit: true, next: false };
                }
                if (hrefTmp.href !== 'javascript:void(0)') {
                    return { url: hrefTmp.href, error: false, next: false };
                } else {
                    return { url: null, error: false, next: true };
                }
            }
        } catch (error) {
            console.log('error parsing url:', error);
            return { url: null, error: true };
        }
    }

    public abstract async load(): Promise<Array<string>>;
}

export interface ICrawlerOptions {
    sameSite: boolean;
    sameDomain: boolean;
    maxLinksSite: number;
    baseUrl: string;
}

export interface ICrawlerReturn {
    url: string;
    error: boolean;
    exit?: boolean;
    next?: boolean;
}
