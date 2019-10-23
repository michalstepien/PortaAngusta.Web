// tslint:disable-next-line:variable-name
const se_scraper = require('se-scraper');
import { SearchSettings } from '../../app/models/searchSettings';

// tslint:disable-next-line:only-arrow-functions
module.exports = async function(d: any) {
    console.log('job start', d.data);
    const dstart = new Date();
    const results: any = {};
    const settings: SearchSettings = d.data.settings;
    const id: SearchSettings = d.data.id;
    const browserConfig = {
        debug_level: 1
    };
    const scrapeJob = {
        search_engine: 'google',
        keywords: settings.keywords,
        num_pages: settings.numberPages,
    };
    const scraper = new se_scraper.ScrapeManager(browserConfig);
    await scraper.start();
    for (const se of settings.searchEngines) {
        scrapeJob.search_engine = se;
        results[se] = await scraper.scrape(scrapeJob);
    }
    await scraper.quit();
    console.log('job end');
    return Promise.resolve({ r: results, id, dstart, dstop: new Date()});
};
