import {IVitality} from '../../common/interfaces/misc/vitality.interface';
import {ESpawnType} from '../interfaces/spawn-type.enum';
import {NPC} from '../models/npc.model';
import * as shortid from 'shortid';
import {WorldObject} from '../models/world-object.model';

export class SpawnVirtual {
	spawnVirtualID: string;
	spawnGroupID: number;
	spawnGroupLocMapID: number;
	spawnType: ESpawnType;
	mapID: string;
	x: number;
	y: number;
	objectID: number;

	npc?: NPC;
	object?: any; //TODO: Object spawns

	constructor() {
		this.spawnVirtualID = shortid.generate();
	}

	static fromNPC(npc: NPC, mapID: string, x: number, y: number) {
		const virt = new SpawnVirtual();

		Object.assign<SpawnVirtual, Partial<SpawnVirtual>>(virt, {
			npc:       npc.toJSON() as NPC,
			spawnType: ESpawnType.NPC,
			objectID:  npc.npcID,
			mapID:     mapID,
			x:         x,
			y:         y
		});

		return virt;
	}

	static fromObject(obj: WorldObject, mapID: string, x: number, y: number) {
		const virt = new SpawnVirtual();

		Object.assign(virt, {
			object: obj,
			mapID:  mapID,
			x:      x,
			y:      y
		});

		return virt;
	}
}