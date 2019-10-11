import kue from 'kue';
import jobs from 'app/jobs';

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth: process.env.REDIS_PASSWORD || undefined
};

const queue = kue.createQueue({
    prefix: process.env.REDIS_PREFIX + ':queue:',
    redis: redisConfig
});

queue.setMaxListeners(jobs.reduce((acc, item) => (acc + item.count), 0));

jobs.map((jobHandler) => {
    queue.process(jobHandler.name, jobHandler.count, async (job, done) => {
        const jobInstance = new jobHandler.cls(job);
        try {
            await jobInstance.handle();
            done();
        } catch (e) {
            console.log(e);
            done(e);
        }
    });
});

export default queue;
