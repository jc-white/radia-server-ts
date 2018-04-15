import {Hero} from '../modules/game/common/models/hero/hero.model';
import {Party} from '../modules/game/common/models/party/party.model';
import {IPartyLocation} from '../modules/game/explore/interfaces/explore.interface';
import {Map} from '../modules/game/common/models/location/map.model';
import {TimedQueue} from '../shared/functions/timed-queue';
import {PlayerSocket} from './player-socket.interface';

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

	getHeroCount() {

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
}