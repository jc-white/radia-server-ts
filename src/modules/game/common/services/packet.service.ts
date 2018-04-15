import {GamePacket} from '../../../../socket/packets/game-packet.interface';
import {Player} from '../../../../socket/player.class';
import {LogMessageType} from '../interfaces/misc/log-message.enum';

export class PacketService {
	constructor() {

	}

	static sendPacket<T>(toPlayer: Player, packet: GamePacket<any>) {
		toPlayer.socket.emit('event', packet);
	}

	static sendMessage(toPlayer: Player, text: string, type: LogMessageType = LogMessageType.GENERAL) {
		toPlayer.socket.emit('message', {
			text: text,
			type: type,
			time: (new Date()).getTime()
		});
	}

	static sendToast(toPlayer: Player, text: string, type: string = 'error') {
		toPlayer.socket.emit('toast', {
			text: text,
			type: type
		});
	}
}