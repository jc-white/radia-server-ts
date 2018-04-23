import {
	OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway
} from '@nestjs/websockets';
import {DBService} from '../modules/db/db.service';
import {PlayerSocket} from './player-socket.interface';
import {RootGateway} from './root-gateway.class';
import {PlayerService} from '../modules/game/common/services/player.service';

@WebSocketGateway({
	port:        5050,
	namespace:   'main'
})
export class GameSocketGateway extends RootGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	constructor(private playerService: PlayerService) {
		super(playerService);
	}

	afterInit() {
		super.afterInit();
		console.log('Main gateway init');
	}

	handleConnection(client: PlayerSocket) {
		super.handleConnection(client);

		if (!client.userID) return;

		this.playerService.addPlayer(client.userID, client);
	}

	handleDisconnect(client: PlayerSocket) {
		if (!client.userID) return;

		this.playerService.removePlayer(client.userID); //TODO: Probably put a delay on this
	}

	@SubscribeMessage('init')
	async handleGameInit(sender: PlayerSocket, data) {
		if (!sender.userID) return;

		sender.emit('connected');

		try {
			const heroCount = await DBService.knex('heroes').where('userID', sender.userID).count('heroID').first();

			if (heroCount.count == 0) {
				sender.emit('redirect', 'game/new');
			}
		} catch (err) {
			console.log(err);
		}
	}
}