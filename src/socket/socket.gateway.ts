import {
	OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway
} from '@nestjs/websockets';
import {DBService} from '../modules/db/db.service';
import {LocationService} from '../modules/game/common/services/location-service.component';
import {PacketService} from '../modules/game/common/services/packet.service';
import {PacketHeroUpdate} from './packets/heroes/heroes.packets';
import {PacketPartyUpdate} from './packets/parties/parties.packets';
import {PlayerSocket} from './player-socket.interface';
import {RootGateway} from './root-gateway.class';
import {PlayerService} from '../modules/game/common/services/player.service';

@WebSocketGateway({
	port:        5050,
	namespace:   'main'
})
export class GameSocketGateway extends RootGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	constructor(private playerService: PlayerService, private locService: LocationService) {
		super();
	}

	afterInit() {
		super.afterInit();
		console.log('Main gateway init');
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
				const heroes          = await player.getHeroes(),
				      party           = await player.getParty(),
				      heroUpdatePack  = new PacketHeroUpdate(heroes),
				      partyUpdatePack = new PacketPartyUpdate(party);

				PacketService.sendPacket(player, heroUpdatePack);
				PacketService.sendPacket(player, partyUpdatePack);

				this.locService.getPartyLocation(party);
			}
		} catch (err) {
			console.log(err);
		}
	}
}