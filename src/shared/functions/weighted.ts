import {Chance} from 'chance';
import * as _ from 'lodash';

export class WeightedList<T> {
	private chance: Chance.Chance;
	public items: Array<T> = [];
	private weightKey: string;

	constructor(items: Array<T>, weightKey: string = 'weight') {
		this.chance    = new Chance();
		this.weightKey = weightKey;

		if (items && items.length) {
			this.items = items;
		}
	}

	add(item: T) {
		if (this.items.indexOf(item) > -1) return;

		this.items.push(item);
	}

	pull(andRemove: boolean = false): T {
		if (!this.items.length) return null;

		const values: Array<T>       = [],
		      weights: Array<number> = [];

		this.items.forEach(item => {
			values.push(item);
			weights.push(item[this.weightKey]);
		});

		const pulledItem = this.chance.weighted<T>(values, weights);

		if (andRemove) {
			_.pull(this.items, pulledItem);
		}

		return pulledItem;
	}

	pullMultiple(amount: number, andRemove: boolean = false): Array<T> {
		if (!this.items.length) return [];

		const items = [];

		for (let x = 0; x < Math.min(this.items.length, amount); x++) {
			const result = this.pull();

			if (andRemove) {
				_.pull(this.items, result);
			}

			items.push(result);
		}

		return items;
	}

	removeBy(predicate: any) {
		if (!this.items.length) return;

		_.remove(this.items, predicate);
	}
}