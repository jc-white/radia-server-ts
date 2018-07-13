import {Component} from '@nestjs/common';
import {WeightedList} from '../../../shared/functions/weighted';
import {LocationService} from '../common/services/location-service.component';
import {ICoordPair} from './interfaces/explore.interface';
import {NPC} from './models/npc.model';
import {SpawnGroup} from './models/spawnGroup.model';
import {SpawnGroupLocationMap} from './models/spawnGroupLocationMap.model';
import {SpawnGroupEntry} from './models/spawnGroupNpcMap.model';
import {SpawnVirtual} from './virtuals/spawn.virtual';
import * as _ from 'lodash';

@Component()
export class SpawnService {
	spawnGroupCache: Array<SpawnGroup> = [];
	spawns: Array<SpawnVirtual>        = [];

	constructor(private locService: LocationService) {

	}

	async buildSpawnGroupCache() {
		this.spawnGroupCache = await SpawnGroup.query()
			.eager('[locationMaps, entries]');
	}

	async evaluateMap(mapID: string) {
		const spawnGroupsInMap = await SpawnGroupLocationMap.findByMapID(mapID);


	}

	//Evaluate a spawn group to determine if anything needs to be spawned
	async evaluateSpawnGroup(spawnGroup: SpawnGroup) {
		//Skip spawn groups without locations or entries
		if (!Array.isArray(spawnGroup.locationMaps)) {
			console.warn('Spawn group has no locationMaps', spawnGroup.spawnGroupID);
			return;
		}

		if (!Array.isArray(spawnGroup.entries)) {
			console.warn('Spawn group has no spawn entries', spawnGroup.spawnGroupID);
			return;
		}

		//Loop through locations that this spawnGroup uses
		spawnGroup.locationMaps.forEach(async locMap => {
			const mapTiles = this.locService.cache.tilesByRegion[locMap.mapID];

			if (_.isEmpty(mapTiles)) {
				console.warn('[evaluateSpawnGroup] Map has no tiles: ' + locMap.mapID);
				return;
			}

			//Get the spawns from this locMap that are already spawned
			const spawnsInGroup = this.findSpawnsBySpawnGroupLocMap(locMap.spawnGroupLocMapID),
			      weightedList  = new WeightedList<{ entry: SpawnGroupEntry, numToSpawn: number, weight: number }>([], 'weight');

			spawnGroup.entries.forEach(async spawnEntry => {
				const currentSpawns = spawnsInGroup.filter((spawn: SpawnVirtual) => spawn.objectID == spawnEntry.objectID && spawn.spawnType == spawnEntry.spawnType);

				if (!currentSpawns || (currentSpawns.length < spawnEntry.maxSpawns) && spawnEntry.maxSpawns > 0) {
					//We need to try and spawn something from this entry since it isn't fully popped yet

					const numToSpawn = _.random(1, spawnEntry.maxSpawns - ((currentSpawns && currentSpawns.length) || 0));

					weightedList.add({
						entry:      spawnEntry,
						numToSpawn: numToSpawn,
						weight:     spawnEntry.spawnWeight
					});
				} else {
					console.log('Nothing to spawn');
				}
			});

			const entryToSpawn = weightedList.pull();

			if (entryToSpawn) {
				for (let x = 0; x < entryToSpawn.numToSpawn; x++) {
					let virt, tile: ICoordPair;

					if (locMap.isEntireMap) {
						tile = await this.locService.getRandomTileInMap(locMap.mapID)
					} else if (locMap.isRegional) {
						tile = await this.locService.getRandomTileInRegion(locMap.mapID, locMap.regionID);
					} else if (locMap.isLocal) {
						tile = _.sample(locMap.cells);
					}

					switch (entryToSpawn.entry.spawnType) {
						case 'npc':
							virt = SpawnVirtual.fromNPC(await NPC.findByID(entryToSpawn.entry.objectID), locMap.mapID, tile.x, tile.y);

							Object.assign<SpawnVirtual, Partial<SpawnVirtual>>(virt, {
								spawnGroupID:       locMap.spawnGroupID,
								spawnGroupLocMapID: locMap.spawnGroupLocMapID,
							});
							break;
						case 'object':

							break;
						case 'item':

							break;
					}

					this.spawns.push(virt);
				}
			}
		});
	}

	findSpawnsBySpawnGroup(spawnGroupID: number) {
		return this.spawns.filter(spawn => spawn.spawnGroupID == spawnGroupID);
	}

	findSpawnsBySpawnGroupLocMap(spawnGroupLocMapID: number) {
		return this.spawns.filter(spawn => spawn.spawnGroupLocMapID == spawnGroupLocMapID);
	}

	findSpawnsByMap(mapID: string) {
		return this.spawns.filter(spawn => spawn.mapID && spawn.mapID == mapID);
	}

	findSpawnsByRegion(mapID: string, regionID: string) {

	}

	findSpawnsByCoords(mapID: string, x: number, y: number) {
		return this.spawns.filter(spawn => (spawn.x && spawn.y) && spawn.x == x && spawn.y == y);
	}
}