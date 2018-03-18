import {Component} from '@nestjs/common';
import {Dictionary} from 'lodash';
import {Socket} from 'socket.io';
import {PlayerSocket} from './player-socket.interface';
import {Player} from './player.class';

@Component()
export class PlayerService {
	players: Dictionary<Player> = {};

	constructor() {

	}

	addPlayer(userID: string, socket: PlayerSocket) {
		this.players[userID] = new Player(userID, socket);
	}

	removePlayer(userID: string) {
		delete this.players[userID];
	}

	getUserIDForSocket(socket: Socket) {

	}
}