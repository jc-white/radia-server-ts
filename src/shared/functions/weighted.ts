import {Chance} from 'chance';

export class WeightedList<T> {
	private chance: Chance.Chance;
	private items: Array<T> = [];
	private weightKey: string;

	constructor(items: Array<T>, weightKey: string = 'weight') {
		this.chance    = new Chance();
		this.weightKey = weightKey;

		if (items && items.length) {
			this.items = items;
		}
	}

	add(item: T) {
		this.items.push(item);
	}

	pull(): T {
		if (!this.items.length) return null;

		const values: Array<T>       = [],
		      weights: Array<number> = [];

		this.items.forEach(item => {
			values.push(item);
			weights.push(item[this.weightKey]);
		});

		return this.chance.weighted<T>(values, weights);
	}
}