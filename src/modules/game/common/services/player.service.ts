import {Component, Global} from '@nestjs/common';
import {Dictionary} from 'lodash';
import {Socket} from 'socket.io';
import {PlayerSocket} from '../../../../socket/player-socket.interface';
import {Player} from '../../../../socket/player.class';

@Global()
export class PlayerService {
	players: Dictionary<Player> = {};

	constructor() {

	}

	addPlayer(userID: number, socket: PlayerSocket) {
		if (this.players[userID]) return;

		this.players[userID] = new Player(userID, socket);
	}

	removePlayer(userID: number) {
		if (!this.players[userID]) return;

		delete this.players[userID];
	}

	getUserIDForSocket(socket: Socket) {

	}
}