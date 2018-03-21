import {
	OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import * as mongoose from 'mongoose';
import {Users} from '../auth/user.model';
import {DBService} from '../db/db.service';
import {HeroService} from '../game/common/services/hero.service';
import {Hero, Heroes} from '../game/models/hero/hero.model';
import {PacketService} from './packet.service';
import {GamePacket} from './packets/game-packet.interface';
import {PHeroUpdate} from './packets/heroes/heroes.packets';
import {PlayerSocket} from './player-socket.interface';
import {GameSocketAuthMiddleware} from './socket-auth.middleware';
import {PlayerService} from './player.service';

const sharedSession = require('express-socket.io-session');

@WebSocketGateway({
	port:        5050,
	middlewares: [GameSocketAuthMiddleware]
})
export class GameSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	static sessionHandler: any;

	@WebSocketServer()
	private server: any;

	constructor(private heroService: HeroService, private playerService: PlayerService, private dbService: DBService, private packetService: PacketService) {

	}

	afterInit(server: any) {
		console.log('Socket server started');

		this.server.use(sharedSession(GameSocketGateway.sessionHandler, {
			autoSave: true
		}));
	}

	handleConnection(client: PlayerSocket) {
		client.userID = client.handshake.session.passport.user;

		this.playerService.addPlayer(client.userID, client);
	}

	handleDisconnect(client: PlayerSocket) {
		this.playerService.removePlayer(client.userID); //TODO: Probably put a delay on this
	}

	@SubscribeMessage('init')
	async handleGameInit(sender: PlayerSocket, data) {
		const player = this.playerService.players[sender.userID];

		sender.emit('connected');

		console.log('Counting heroes');

		const heroCount = await Heroes.count({
			userID: sender.userID
		});

		if (heroCount == 0) {
			sender.emit('redirect', 'game/new');
		} else {
			console.log('Getting heroes');

			const heroes = await this.heroService.getHeroes(sender.userID),
			      pack   = new GamePacket<PHeroUpdate>('heroes', 'heroUpdate', heroes);

			console.log(pack);

			this.packetService.sendPacket(player, pack);
		}
	}
}