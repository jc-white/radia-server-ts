import {Hero} from '../modules/game/common/models/hero/hero.model';
import {Item} from '../modules/game/common/models/items/item.model';
import {Party} from '../modules/game/common/models/party/party.model';
import {ItemService} from '../modules/game/common/services/item.service';
import {TimedQueue} from '../shared/functions/timed-queue';
import {PlayerSocket} from './player-socket.interface';
import * as _ from 'lodash';

export class Player {
	userID: number;
	socket: PlayerSocket;
	party: Party;
	heroes: Array<Hero>;
	queue: TimedQueue = new TimedQueue();

	constructor(userID: number, socket: PlayerSocket) {
		Object.assign(this, {
			userID: userID,
			socket: socket
		});
	}

	async getParty(): Promise<Party> {
		if (this.party) {
			return this.party;
		}

		this.party = await Party.query().findOne('userID', this.userID);

		return this.party;
	}

	async getHeroes(): Promise<Array<Hero>> {
		if (this.heroes) {
			return this.heroes;
		}

		this.heroes = await Hero.query().where('userID', this.userID);

		return this.heroes;
	}

	async getItems(): Promise<Array<Item>> {
		if (!this.heroes) {
			await this.getHeroes();
		}

		if (!this.party) {
			await this.getParty();
		}

		const items: Array<any> = [
			...Object.keys(this.party.inventory.items) || []
		];

		this.heroes.filter(hero => !_.isEmpty(hero.equipment)).forEach(hero => {
			items.push(...Object.values(hero.equipment))
		});

		return items.length ? ItemService.getItems(items) : [];
	}
}