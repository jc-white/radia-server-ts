import {Model, QueryContext} from 'objection';
import {ICoordPair} from '../../../explore/interfaces/explore.interface';
import {PartyResources} from '../../dicts/resources.dict';
import {Item} from '../items/item.model';
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

	save() {
		return Party.query().where('partyID', this.partyID).update(this.toJSON());
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

	addItem(item: Item, quantity: number = 1) {
		const itemID = item.itemID.toString();

		if (this.inventory.items[itemID]) {
			this.inventory.items[itemID] += quantity;
		} else {
			this.inventory.items[itemID] = quantity;
		}
	}

	removeItem(item: Item, quantity: number = 1) {
		if (!this.hasItem(item, quantity)) return false;

		const itemID = item.itemID.toString();

		this.inventory.items[itemID] -= quantity;

		if (this.inventory.items[itemID] <= 0) {
			delete this.inventory.items[itemID];
		}
	}

	hasItem(item: Item, quantity: number = 1) {
		const itemID = item.itemID.toString();

		return Object.keys(this.inventory.items).includes(itemID) && this.inventory.items[itemID] >= quantity;
	}
}