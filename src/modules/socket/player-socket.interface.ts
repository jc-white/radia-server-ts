import {MongoStore} from 'connect-mongo';
import {Socket} from "socket.io";


export interface PlayerSocket extends Socket {
	userID: string;
	handshake: {
		headers: any;
		time: string;
		address: string;
		xdomain: boolean;
		secure: boolean;
		issued: number;
		url: string;
		query: any;
		sessionStore: MongoStore;
		sessionID: string;
		session: {
			cookie: Object,
			passport: {
				user: string
			}
		}
	}
}