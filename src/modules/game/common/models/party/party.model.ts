import {Model} from 'objection';
import {ICoordPair} from '../../../explore/interfaces/explore.interface';
import {PartyResources} from '../../dicts/resources.dict';
import {Region} from '../location/region.model';
import {EPartyCurrentStatus} from './party.enum';

export interface IInventory {
	items: {
		[itemID: number]: number
	}
}

export interface IPartyResources {
	[resourceName: string]: number
}

export class Party extends Model {
	static tableName: string = 'parties';
	static idColumn: string  = 'partyID';

	partyID: number;
	userID: string;
	inventory: IInventory               = {
		items: {}
	};
	resources: Partial<IPartyResources> = {};
	maxWeight: number;
	mapID: string;
	posX: number;
	posY: number;
	fatigue: number;

	$previousPos: ICoordPair;
	$currentRegion: Region;
	$currentStatus: EPartyCurrentStatus = EPartyCurrentStatus.IDLE;

	static getByUserID(userID: number) {
		return this.query().where('userID', userID).first();
	}

	setPos(x: number, y: number) {
		this.$previousPos = {x: this.posX, y: this.posY};

		this.posX = x;
		this.posY = y;
	}

	addFatigue(value: number) {
		this.setFatigue(this.fatigue + value);
	}

	removeFatigue(value: number) {
		this.setFatigue(this.fatigue - value);
	}

	setFatigue(value: number) {
		this.fatigue = Math.max(0, Math.min(value, 100));
	}

	setCurrentRegion(region: Region) {
		this.$currentRegion = region;
	}

	setCurrentStatus(status: EPartyCurrentStatus) {
		this.$currentStatus = status;
	}

	hasResource(resourceName: PartyResources, amount: number = 1) {
		return this.resources[resourceName] >= amount;
	}

	addResource(resourceName: PartyResources, amount: number = 1) {
		if (!this.resources[resourceName]) {
			this.resources[resourceName] = amount;
		} else {
			this.resources[resourceName] += amount;
		}
	}

	removeResource(resourceName: string, amount: number = 1) {
		if (!this.resources[resourceName]) return;

		this.resources[resourceName] = Math.max(0, this.resources[resourceName] - amount);
	}

	getResource(resourceName: string) {
		return this.resources[resourceName];
	}

	save() {
		return Party.query().where('partyID', this.partyID).update(this.toJSON());
	}
}