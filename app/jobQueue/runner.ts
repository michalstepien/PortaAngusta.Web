import Bull from 'bull';
const queueSearchEngine = new Bull('queueSearchEngine', 'redis://localhost:6379');

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
    // A job's progress was updated!
});
queueSearchEngine.on('completed', (job, result) => {
    console.log('completed');
    console.log('result:', result);
});
queueSearchEngine.on('failed', (job, err) => {
    console.error('failed');
});
