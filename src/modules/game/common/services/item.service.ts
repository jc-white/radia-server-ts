import {Component} from '@nestjs/common';
import {Item} from '../models/items/item.model';
import * as _ from 'lodash';

@Component()
export class ItemService {
	static cache: {
		[itemID: number]: Item
	} = {};

	constructor() {

	}

	static cacheItem(item: Item) {
		if (this.cache[item.itemID]) return;

		this.cache[item.itemID] = item;
	}

	async getItem(itemID: number) {
		return ItemService.getItem(itemID);
	}

	async getItems(itemIDs: Array<number>) {

	}

	static async getItem(itemID: number) {
		const item = await Item.query().findOne('itemID', itemID);

		if (!item) {
			console.error('Item not found: ' + itemID);
			return;
		}

		this.cacheItem(item);

		return ItemService.cache[item.itemID];
	}

	static async getItems(itemIDs: Array<number>) {
		itemIDs = itemIDs.map(i => parseInt(i as any));

		const items = await Item.query().whereIn('itemID', itemIDs);

		items.forEach(item => this.cacheItem(item));

		const found    = items.map(item => item.itemID),
		      notFound = _.difference(itemIDs, items.map(item => item.itemID));

		if (notFound.length) {
			notFound.forEach(notFoundItemID => console.error('Item not found: ' + notFoundItemID));
		}

		return found.map(itemID => this.cache[itemID]);
	}
}