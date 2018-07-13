import {Dictionary} from 'lodash';
import {Model, QueryContext} from 'objection';
import {Utils} from '../../../../../shared/functions/utils';
import {IStatList} from '../../interfaces/hero/stats.interface';
import * as _ from 'lodash';

export type ItemType = 'usable' | 'equipment' | 'misc';
export type EquipSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'neck' | 'finger' | 'primary' | 'secondary';
export type ItemSubType =
	'piercing'
	| 'slashing'
	| 'blunt'
	| 'lightshield'
	| 'heavyshield'
	| 'lightarmor'
	| 'heavyarmor'
	| 'clothing'
	| 'potion'
	| 'scroll'
	| 'usablespecial'
	| 'jewelry'
	| 'readable'
	| 'usable'
	| 'weapon'
	| 'armor'
	| 'shield'
	| 'accessory';

export const UsableSubTypes = ['potion', 'scroll', 'usablespecial'];

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
		[trigger: string]: string;
	};
	meta: any;
	info: string;
	tags: Array<string>;

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

	//region Usable
	isUsable() {
		return this.itemType == 'usable' && ((this.itemSubTypes && this.itemSubTypes.length && UsableSubTypes.indexOf(this.itemSubTypes[0]) > -1) || (this.scripts && this.scripts.use));
	}

	getUsableType() {
		if (!this.isUsable()) return null;

		if (this.itemSubTypes && this.itemSubTypes.length) return this.itemSubTypes[0];

		return this.scripts.use;
	}

	usableRequiresTarget() {
		if (!this.isUsable()) return false;

		return this.hasMeta('target') && this.getMeta('target') === true;
	}
	//endregion

	//region Equippable
	isEquippable() {
		return this.itemType == 'equipment';
	}
	//endregion

	//region Meta
	hasMeta(metaKey: string) {
		return this.meta && _.has(this.meta, metaKey) && !_.isEmpty(this.meta[metaKey]);
	}

	getMeta<T>(metaKey: string): T {
		if (!this.hasMeta(metaKey)) return null;

		return _.get<T>(this.meta, metaKey);
	}
	//endregion

	//region Misc
	hasTag(tag: string) {
		return Array.isArray(this.tags) && this.tags.indexOf(tag) > -1;
	}

	canDiscard() {
		return !this.hasTag('no-discard');
	}
	//endregion
}