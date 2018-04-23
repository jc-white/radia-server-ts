import {Dictionary} from 'lodash';
import {Model, QueryContext} from 'objection';
import {Utils} from '../../../../../shared/functions/utils';
import {IStatList} from '../../interfaces/hero/stats.interface';
import * as _ from 'lodash';

export type ItemType = 'usable' | 'equipment' | 'misc';
export type EquipSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'neck' | 'finger' | 'primary' | 'secondary';

export class Item extends Model {
	static tableName: string = 'items';
	static idColumn: string  = 'itemID';

	itemID: number;
	itemType: ItemType;
	name: string;
	stats: IStatList;
	skills: Dictionary<number>;
	levelReq: number;
	icon: string;
	equipSlots: Array<EquipSlot>;
	scripts: {
		[trigger: string]: string
	};
	meta: {};
	info: string;

	$afterGet(ctx: QueryContext) {
		if (!this.info) return;

		const pattern = /\[\[(.*?)\]\]/g,
		      matches = Utils.getMatches(this.info, pattern);

		if (matches.length) {
			matches.forEach(match => {
				const replacementValue = _.get<any>(this.meta, match[1]);

				if (replacementValue) {
					this.info = this.info.replace(match[0], replacementValue.toString());
				}
			});
		}
	}
}