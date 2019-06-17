import {Model} from 'objection';
import {SpawnGroupLocationMap} from './spawnGroupLocationMap.model';
import {SpawnGroupEntry} from './spawnGroupNpcMap.model';

export class SpawnGroup extends Model {
	static tableName: string = 'spawnGroups';
	static idColumn: string  = 'spawnGroupID';

	spawnGroupID: number;
	name: string;
	isActive: boolean;

	locationMaps?: Array<SpawnGroupLocationMap>;
	entries?: Array<SpawnGroupEntry>;

	static relationMappings = {
		locationMaps: {
			relation:   Model.HasManyRelation,
			modelClass: SpawnGroupLocationMap,
			join:       {
				from: 'spawnGroups.spawnGroupID',
				to:   'spawnGroupLocationMap.spawnGroupID'
			}
		},
		entries:      {
			relation:   Model.HasManyRelation,
			modelClass: SpawnGroupEntry,
			join:       {
				from: 'spawnGroups.spawnGroupID',
				to:   'spawnGroupEntryMap.spawnGroupID'
			}
		}
	};

	static getByID(spawnGroupID: number) {
		return this.query().where('spawnGroupID', spawnGroupID)
			.eager('[locationMaps, entries]')
			.first();
	}
}