import {Component, OnModuleInit} from '@nestjs/common';
import {PacketSendPartyUpdate} from '../../../socket/packets/parties/parties.packets-send';
import {Player} from '../../../socket/player.class';
import {DBService} from '../../db/db.service';
import {Party} from '../common/models/party/party.model';
import {PacketService} from '../common/services/packet.service';
import {PlayerService} from '../common/services/player.service';
import * as _ from 'lodash';

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
		const player: Player = this.playerService.players[party.userID];

		if (player && !_.isEqual(party, player.party)) {
			PacketService.sendPacket(player, new PacketSendPartyUpdate(party));

			player.updateParty(party);
		}
	}
}