import {Model} from 'objection';

export class Map extends Model {
	static tableName: string = 'maps';
	static idColumn: string = 'mapID';

	mapID: string;
	name: string;
	tileset: string;
}