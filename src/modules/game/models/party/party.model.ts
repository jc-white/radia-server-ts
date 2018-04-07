import {Model} from 'objection';

export interface IInventory {
	items: {
		[itemID: number]: number
	}
}

export class Party extends Model {
	static tableName: string = 'parties';
	static idColumn: string  = 'partyID';

	partyID: number;
	userID: string;
	inventory: IInventory = {
		items: {}
	};
	maxWeight: number;
	map: string;
	posX: number;
	posY: number;

	static getByUserID(userID: number) {
		return this.query().where('userID', userID).first();
	}
}