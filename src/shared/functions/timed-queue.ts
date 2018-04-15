import * as _ from 'lodash';

export interface TimedJob {
	before?: (job: TimedJob) => any;
	after?: (job: TimedJob) => any;
	time?: number;
	tags?: string | Array<string>;
}

export class TimedQueue {
	private queue: Array<TimedJob> = [];
	private tHandle: any           = null;
	private done: boolean          = true;
	private currentIndex: number   = null;

	constructor() {
	}

	addTask(job: () => any, time?: number, tags?: Array<string>|string)
	addTask(job: TimedJob, time?: number, tags?: Array<string>|string)
	addTask(job: any, time?: number, tags?: Array<string>|string): number {
		let _job;

		if (_.isFunction(job)) {
			_job = {
				time:  time,
				after: job,
				tags:  tags
			};
		} else {
			_job = job;
		}

		if (tags && !_job.tags) {
			_job.tags = tags;
		}

		if (time && !_job.time) {
			_job.time = time;
		}

		if (typeof _job.tags === "string") {
			_job.tags = [_job.tags];
		}

		return this.queue.push(_job);
	}

	afterNext(job: TimedJob): number {
		return this.queue.unshift(job);
	}

	removeByTag(tag: string) {
		_.pull(this.queue, ...this.queue.filter(job => job.tags && job.tags.indexOf(tag) > -1));
	}

	removeTask(job: TimedJob) {
		if (!this.done) {
			throw new Error('Job is under process');
		}

		let index = this.queue.indexOf(job);

		if (index == -1) {
			throw new Error('Job not found');
		}

		this.queue.splice(index, 1);
	}

	start() {
		if (!this.done) {
			return;
		}

		if (this.queue.length == 0) {
			return;
		}

		this.done    = false;
		this.tHandle = setTimeout(() => {
			this.next()
		}, 0);
	}

	private next() {
		if (this.queue.length == 0) {
			this.done = true;
			return;
		}

		let job: TimedJob = this.queue.shift();

		if (job.before) {
			job.before.call(null, job);
		}

		this.tHandle = setTimeout(() => {
			if (job.after) {
				job.after.call(null, job);
			}

			this.next();
		}, job.time || 0);
	}

	stop() {
		if (!this.done) {
			throw new Error('Queue is not started');
		}

		clearTimeout(this.tHandle);
	}

	reset() {
		clearTimeout(this.tHandle);
		this.tHandle = null;
		this.done    = true;

		if (this.queue.length > 0) {
			this.queue.splice(0, this.queue.length);
		}
	}

	getJobs() {
		return this.queue;
	}
}