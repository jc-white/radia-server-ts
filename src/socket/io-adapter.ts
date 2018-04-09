import {IoAdapter} from '@nestjs/websockets';

const sharedSession = require('express-socket.io-session');

export class CustomIoAdapter extends IoAdapter {
	public static sessionHandler: any;

	public createWithNamespace(port: number, namespace: string, server?) {
		const newServer = server
			? server.of(namespace)
			: this.createIOServer(port).of(namespace);

		newServer.use(sharedSession(CustomIoAdapter.sessionHandler, {
			autoSave: true
		}));

		return newServer;
	}
}