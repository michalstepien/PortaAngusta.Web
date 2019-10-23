import Bull from 'bull';
import connection from '../app/db';
import { Base } from '../app/models/base';
import { Job, JobStatut } from '../app/models/job';
import { JobResults } from '../app/models/jobResults';


(async () => {
    try {
        const queueSearchEngine = new Bull('queueSearchEngine', 'redis://localhost:6379');
        await connection.init();
        await connection.ses();

        queueSearchEngine.process(__dirname + '/jobs/searchEngine.js');
        queueSearchEngine.on('error', (error) => {
            console.error('Error:', error);
        });
        queueSearchEngine.on('waiting', (jobId) => {
            console.log('Waiting');
        });
        queueSearchEngine.on('active', (job) => {
            console.log('Active');
        });
        queueSearchEngine.on('stalled', (job) => {
            console.log('stalled');
        });
        queueSearchEngine.on('progress', (job, progress) => {
            console.log('progress');
        });
        queueSearchEngine.on('completed', async (job, result) => {
            const j = new Job();
            j.id =  result.id;
            await j.load();
            j.status = JobStatut.completed;
            await j.save();

            const jr = new JobResults();
            jr.job = j;
            jr.results = result.r;
            jr.dateStart = result.dstart;
            jr.dateStop = result.dstop;
            await jr.save();

            console.log('completed');
        });
        queueSearchEngine.on('failed', (job, err) => {
            console.error('failed');
        });

    } catch (e) {

    }
})();


