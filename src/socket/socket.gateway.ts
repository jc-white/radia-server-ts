import {
	OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import {DBService} from '../modules/db/db.service';
import {Party} from '../modules/game/models/party/party.model';
import {HeroService} from '../modules/game/services/hero.service';
import {PacketService} from '../modules/game/services/packet.service';
import {PacketHeroUpdate} from './packets/heroes/heroes.packets';
import {PacketPartyUpdate} from './packets/parties/parties.packets';
import {PlayerSocket} from './player-socket.interface';
import {GameSocketAuthMiddleware} from './socket-auth.middleware';
import {PlayerService} from '../modules/game/services/player.service';

const sharedSession = require('express-socket.io-session');

@WebSocketGateway({
	port:        5050,
	middlewares: [GameSocketAuthMiddleware]
})
export class GameSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	static sessionHandler: any;

	@WebSocketServer()
	private server: any;

	constructor(private playerService: PlayerService, private dbService: DBService) {

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

		try {
			const heroCount = await DBService.knex('heroes').where('userID', sender.userID).count('heroID').first();

			if (heroCount.count == 0) {
				sender.emit('redirect', 'game/new');
			} else {
				const heroes          = await HeroService.getHeroes(sender.userID, true),
				      party           = await Party.getByUserID(sender.userID),
				      heroUpdatePack  = new PacketHeroUpdate(heroes),
				      partyUpdatePack = new PacketPartyUpdate(party);

				PacketService.sendPacket(player, heroUpdatePack);
				PacketService.sendPacket(player, partyUpdatePack);
			}
		} catch (err) {
			console.log(err);
		}
	}
}