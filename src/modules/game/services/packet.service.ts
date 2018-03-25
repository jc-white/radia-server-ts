import {GamePacket} from '../../../socket/packets/game-packet.interface';
import {Player} from '../../../socket/player.class';

export class PacketService {
	constructor() {

	}

	static sendPacket<T>(toPlayer: Player, packet: GamePacket<any>) {
		toPlayer.socket.emit('event', packet);
	}
}