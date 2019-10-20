// tslint:disable-next-line:variable-name
const se_scraper = require('se-scraper');

// tslint:disable-next-line:only-arrow-functions
module.exports = async function(job: any) {
    console.log('job start', job.data.keyword);
    const browserConfig = {
        debug_level: 1
    };
    const scrapeJob = {
        search_engine: 'google',
        keywords: [job.data.keyword],
        num_pages: 1,

        google_settings: {
            gl: 'us', // The gl parameter determines the Google country to use for the query.
            hl: 'en', // The hl parameter determines the Google UI language to return results.
            start: 0, // Determines the results offset to use, defaults to 0.
            num: 10, // Determines the number of results to show, defaults to 10. Maximum is 100.
        },
    };
    const scraper = new se_scraper.ScrapeManager(browserConfig);
    await scraper.start();
    const r = await scraper.scrape(scrapeJob);
    await scraper.quit();
    console.log('job end');
    return Promise.resolve(r.results[job.data.keyword]);
};
