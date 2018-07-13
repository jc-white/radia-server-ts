import {Model} from 'objection';
import * as path from 'path';
import {ICoordPair} from '../interfaces/explore.interface';
import {SpawnGroup} from './spawnGroup.model';

export class SpawnGroupLocationMap extends Model {
	static tableName: string = 'spawnGroupLocationMap';
	static idColumn: string  = 'spawnGroupLocMapID';

	spawnGroupLocMapID: number;
	spawnGroupID: number;
	mapID: string;
	regionID: string;
	cells: Array<ICoordPair>;
	maxGroupSpawns: number;
	groupSpawnChance: number;
	spawnEvalTime: number;

	static relationMappings = {
		spawnGroup: {
			relation:   Model.HasOneRelation,
			modelClass: path.join(__dirname, 'spawnGroup.model.ts'),
			join:       {
				from: 'spawnGroupLocationMap.spawnGroupID',
				to:   'spawnGroups.spawnGroupID'
			}
		}
	};

	static findByMapID(mapID: string) {
		return this.query()
			.leftJoinRelation('spawnGroup')
			.where('spawnGroup.isActive', 1)
			.where('mapID', mapID);
	}

	get isEntireMap() {
		return this.mapID && !this.isRegional && !this.isLocal;
	}

	get isRegional() {
		return this.regionID && !this.isLocal;
	}

	get isLocal() {
		return !!this.cells && Array.isArray(this.cells);
	}
}