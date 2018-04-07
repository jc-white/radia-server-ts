import {Component, OnModuleInit} from '@nestjs/common';
import {PacketPartyUpdate} from '../../../socket/packets/parties/parties.packets';
import {DBService} from '../../db/db.service';
import {Party} from '../models/party/party.model';
import {PacketService} from './packet.service';
import {PlayerService} from './player.service';

@Component()
export class PartyService implements OnModuleInit {
	constructor(private db: DBService, private playerService: PlayerService) {

	}


	onModuleInit() {
		DBService.listen('party', (data) => {
			const result = DBService.mapNotification<Party>(data, new Party());

			this.handlePartyChange(result.new);
		});
	}

	handlePartyChange(party: Party) {
		const player = this.playerService.players[party.userID];

		if (player) {
			PacketService.sendPacket(player, new PacketPartyUpdate(party));
		}
	}
}