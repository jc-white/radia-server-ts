import {PlayerSocket} from './player-socket.interface';

export class Player {
	userID: number;
	socket: PlayerSocket;

	constructor(userID: number, socket: PlayerSocket) {
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