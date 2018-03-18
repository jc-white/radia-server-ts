import {PlayerSocket} from './player-socket.interface';

export class Player {
	userID: string;
	socket: PlayerSocket;

	constructor(userID: string, socket: PlayerSocket) {
		Object.assign(this, {
			userID: userID,
			socket: socket
		});
	}

	getHeroCount() {
		//this.heroService.countHeroes(sender.userID);
	}

	getHeroes() {

	}
}