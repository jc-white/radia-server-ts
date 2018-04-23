import {OnGatewayConnection, OnGatewayInit, WebSocketServer} from '@nestjs/websockets';
import {PlayerService} from '../modules/game/common/services/player.service';
import {PlayerSocket} from './player-socket.interface';

export abstract class RootGateway implements OnGatewayConnection, OnGatewayInit {
	@WebSocketServer()
	private server: any;

	protected constructor(private _playerService: PlayerService) {

	}

	handleConnection(client: PlayerSocket) {
		if (!client.handshake.session || !client.handshake.session.passport) {
			console.log('bad client', client);
			return;
		}

		client.userID = client.handshake.session.passport.user;
	}

	addPlayer(client: PlayerSocket) {
		this._playerService.addPlayer(client.userID, client);
	}

	afterInit() {
		console.log('Root gateway started');
	}
}