import queue from 'config/queue';

export class BaseJob {

    job;
    static ttl = 2 * 60 * 1000;
    static attempts = 5;

    static dispatch(data) {
        return queue
            .create(this.name, data)
            .ttl(this.ttl)
            .attempts(this.attempts)
            .removeOnComplete(true)
            .save();
    }

    constructor(job) {
        this.job = job;
    }

    async handle() {
        throw new Exception("not implemented");
    }

}
