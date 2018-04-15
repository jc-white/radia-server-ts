import {Dictionary} from 'lodash';
import {Model} from 'objection';

export class Forage extends Model {
	static tableName: string = 'forage';
	static idColumn: string  = 'forageEntryID';

	forageEntryID: number;
	mapID: string;
	regionID: string;
	itemID: number;
	weight: number;
	message: string;
	effects: {
		resources: Dictionary<number>,
		fatigue: number
	};

	static getByMapID(mapID: string, includeRegionEntries: boolean = false) {
		const query = Forage.query()
			.where('mapID', mapID);

		if (!includeRegionEntries) {
			query.whereNull('regionID');
		}

		return query;
	}

	static async getByRegionID(mapID: string, regionID: string, includeMapEntries: boolean = true) {
		const query = Forage.query()
			.where('mapID', mapID);

		if (includeMapEntries) {
			query.orWhere('regionID', regionID);
		} else {
			query.andWhere('regionID', regionID);
		}

		return query;
	}
}