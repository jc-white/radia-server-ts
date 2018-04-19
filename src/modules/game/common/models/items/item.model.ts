import {Model} from 'objection';
import {IStatList} from '../../interfaces/hero/stats.interface';

export type ItemType = 'usable' | 'equipment' | 'misc';
export type EquipSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'neck' | 'finger' | 'primary' | 'secondary';

export class Item extends Model {
	static tableName: string = 'items';
	static idColumn: string = 'itemID';

	itemID: number;
	itemType: ItemType;
	name: string;
	stats: IStatList;
	traits: Array<string>;
	levelReq: number;
	icon: string;
	equipSlots: Array<EquipSlot>;
	scripts: {
		[trigger: string]: string
	};
	meta: {};
}