import {Dictionary} from 'lodash';
import {Model, QueryContext} from 'objection';
import {Utils} from '../../../../../shared/functions/utils';
import {IStatList} from '../../interfaces/hero/stats.interface';
import * as _ from 'lodash';

export type ItemType = 'usable' | 'equipment' | 'misc';
export type EquipSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'neck' | 'finger' | 'primary' | 'secondary';
export type ItemSubType =
	'slashing'
	| 'piercing'
	| 'blunt'
	| 'lightshield'
	| 'heavyshield'
	| 'lightarmor'
	| 'heavyarmor'
	| 'clothing'
	| 'targetsingle'
	| 'targetparty';

export class Item extends Model {
	static tableName: string = 'items';
	static idColumn: string  = 'itemID';

	itemID: number;
	itemType: ItemType;
	itemSubTypes: Array<ItemSubType>;
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

		//Cast the itemID to an int, since it comes as a string from Postgres
		this.itemID = parseInt(this.itemID as any, 10);

		//Parse subtypes
		//@ts-ignore: itemSubTypes is not parsed by node-pg because it's an array of custom types, so we need to convert its string representation into an array
		//Since it's one-dimensional this can just be a regex + split
		this.itemSubTypes = this.itemSubTypes ? this.itemSubTypes.replace(/[\{\}]/g, '').split(',') : [];
	}
}