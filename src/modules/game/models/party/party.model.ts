import {Model} from 'objection';

export interface IInventory {
	items: {
		[itemID: number]: number
	}
}

export interface IPartyResources {
	gold: number;
	wood: number;
	meals: number;
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
	map: string;
	posX: number;
	posY: number;

	static getByUserID(userID: number) {
		return this.query().where('userID', userID).first();
	}
}