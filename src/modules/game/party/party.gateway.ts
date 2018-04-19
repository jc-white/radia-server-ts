import {OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {PacketHeroUpdate} from '../../../socket/packets/heroes/heroes.packets';
import {PacketItems, PacketPartyUpdate} from '../../../socket/packets/parties/parties.packets';
import {PlayerSocket} from '../../../socket/player-socket.interface';
import {RootGateway} from '../../../socket/root-gateway.class';
import {PacketService} from '../common/services/packet.service';
import {PartyService} from './party.service';
import {PlayerService} from '../common/services/player.service';

@WebSocketGateway({
	port:      5050,
	namespace: 'party'
})
export class PartyGateway extends RootGateway implements OnGatewayConnection, OnGatewayInit {
	constructor(private playerService: PlayerService, private partyService: PartyService) {
		super(playerService);
	}

	@SubscribeMessage('init')
	async handlePartyInit(sender: PlayerSocket, data) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID];

			const [heroes, party, items] = await Promise.all([player.getHeroes(), player.getParty(), player.getItems()]);

			const heroUpdatePack  = new PacketHeroUpdate(heroes),
			      partyUpdatePack = new PacketPartyUpdate(party),
			      itemsPack       = new PacketItems(items);

			PacketService.sendPacket(player, heroUpdatePack);
			PacketService.sendPacket(player, partyUpdatePack);
			PacketService.sendPacket(player, itemsPack);
		} catch (error) {
			console.log('handleMapInit error', error);
		}
	}
}