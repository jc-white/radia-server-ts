import {
	OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import {GameSocketAuthMiddleware} from './socket-auth.middleware';

const sharedSession = require('express-socket.io-session');

@WebSocketGateway({
	port:        5050,
	middlewares: [GameSocketAuthMiddleware]
})
export class GameSocketGateway implements OnGatewayConnection, OnGatewayInit {
	static sessionHandler: any;

	@WebSocketServer()
	private server: any;

	constructor() {

	}

	afterInit(server: any) {
		console.log('Socket server started');

		this.server.use(sharedSession(GameSocketGateway.sessionHandler, {
			autoSave: true
		}));
	}

	handleConnection(client: any) {
		console.log('Got new client:', client.id);
	}

	@SubscribeMessage('init')
	async handleGameInit(sender, data) {
/*		sender.emit('connected');

		let heroes = await this.heroService.getHeroes(sender.handshake.session.passport.user);

		console.log('Heroes?', heroes, sender.handshake.session.passport.user);

		if (!heroes.length) {
			sender.emit('redirect', 'game/new');
		}*/
	}
}