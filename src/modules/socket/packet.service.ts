import {Component, OnModuleInit} from '@nestjs/common';
import {GamePacket} from './packets/game-packet.interface';
import {Player} from './player.class';
import {PlayerService} from './player.service';

@Component()
export class PacketService implements OnModuleInit {
	constructor(private playerService: PlayerService) {

	}

	onModuleInit() {
	}

	sendPacket<T>(toPlayer: Player, packet: GamePacket<any>) {
		toPlayer.socket.emit('event', packet);
	}
}