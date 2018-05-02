import {Component} from '@nestjs/common';
import {PacketItem} from '../../../../socket/packets/parties/parties.packets';
import {Player} from '../../../../socket/player.class';
import {Item} from '../models/items/item.model';
import * as _ from 'lodash';
import {PacketService} from './packet.service';

@Component()
export class ItemService {
	static cache: Map<number, Item> = new Map<number, Item>();

	constructor() {

	}

	static cacheItem(item: Item) {
		if (ItemService.cache.has(item.itemID)) return;

		ItemService.cache.set(item.itemID, item);
	}

	async getItem(itemID: number) {
		return ItemService.getItem(itemID);
	}

	async getItems(itemIDs: Array<number>) {

	}

	static async getItem(itemID: number) {
		//Cast itemID to int since sometimes they come as strings directly from Postgres
		itemID = parseInt(itemID as any);

		if (ItemService.cache.has(itemID)) {
			return ItemService.cache.get(itemID);
		}

		const item = await Item.query().findOne('itemID', itemID);

		if (!item) {
			console.error('Item not found: ' + itemID);
			return;
		}

		this.cacheItem(item);

		return ItemService.cache.get(item.itemID);
	}

	static async getItems(itemIDs: Array<number>) {
		//Cast itemIDs to int since sometimes they come as strings directly from Postgres
		itemIDs = itemIDs.map(i => parseInt(i as any));

		let items = [];

		const cachedItemIDs = _.intersection(itemIDs, Array.from(ItemService.cache.keys()));

		if (cachedItemIDs.length) {
			cachedItemIDs.forEach(itemID => {
				items.push(ItemService.cache.get(itemID));
			});
		}

		//We can return early if all items were cached
		if (_.isEqual(itemIDs, cachedItemIDs)) {
			return items;
		}

		let itemIDsToQuery = _.difference(itemIDs, cachedItemIDs);

		if (itemIDsToQuery.length) {
			const queriedItems = await Item.query().whereIn('itemID', itemIDsToQuery);

			queriedItems.forEach(item => ItemService.cacheItem(item));

			queriedItems.forEach(item => {
				items.push(ItemService.cache.get(item.itemID));
			});
		}

		const notFound = _.difference(itemIDs, items.map(item => item.itemID));

		if (notFound.length) {
			notFound.forEach(notFoundItemID => console.error('Item not found: ' + notFoundItemID));
		}

		return items;
	}

	static async sendItemToClient(player: Player, itemID: number) {
		if (!player || !player.socket) return;

		const item = await ItemService.getItem(itemID);

		if (!item) {
			console.warn('Tried to send invalid item to player: ', itemID);
			return;
		}

		const packet = new PacketItem(item);

		PacketService.sendPacket(player, packet);
	}
}