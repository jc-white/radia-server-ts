import {Model} from 'objection';
import {ESpawnType} from '../interfaces/spawn-type.enum';

export class SpawnGroupEntry extends Model {
	static tableName: string = 'spawnGroupEntryMap';
	static idColumn: string  = 'spawnGroupEntryID';

	spawnGroupEntryID: number;
	spawnGroupID: number;
	spawnType: ESpawnType;
	objectID: number;
	maxSpawns: number;
	spawnWeight: number;
}