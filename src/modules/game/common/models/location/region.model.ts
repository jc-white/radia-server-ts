import {Model} from 'objection';

export class Region extends Model {
	static tableName: string = 'regions';
	static idColumn: string = 'regionID';

	regionID: string;
	mapID: string;
	name: string;
	minSpawnLevel: number;
	maxSpawnLevel: number;
	entryDescription: string;

	static findByRegionID(regionID: string) {
		return Region.query().findOne('regionID', regionID);
	}
}