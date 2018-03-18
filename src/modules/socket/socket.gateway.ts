import {
	OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import {DBService} from '../db/db.service';
import {HeroService} from '../game/common/services/hero.service';
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

		let heroCount = await this.heroService.countHeroes(sender.userID);

		if (heroCount == 0) {
			sender.emit('redirect', 'game/new');
		} else {
			const heroes = await this.heroService.getHeroes(sender.userID),
			      pack   = new GamePacket<PHeroUpdate>('heroes', 'heroUpdate', heroes);

			console.log(heroes[0].getName());

			this.packetService.sendPacket(player, pack);
		}
	}
}