import {Socket} from "socket.io";


export interface PlayerSocket extends Socket {
	userID: number;
	handshake: {
		headers: any;
		time: string;
		address: string;
		xdomain: boolean;
		secure: boolean;
		issued: number;
		url: string;
		query: any;
		sessionID: string;
		session: {
			cookie: Object,
			passport: {
				user: number
			}
		}
	}
}