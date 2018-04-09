import {OnGatewayInit, WebSocketServer} from '@nestjs/websockets';

export abstract class RootGateway implements OnGatewayInit {
	@WebSocketServer()
	private server: any;

	afterInit() {
		console.log('Root gateway started');
	}
}