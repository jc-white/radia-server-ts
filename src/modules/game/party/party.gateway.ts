import {OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {PacketSendHeroUpdate} from '../../../socket/packets/heroes/heroes.packets';
import {
	PacketReceiveEquipItem,
	PacketReceiveUnequipItem, PacketReceiveUseItem
} from '../../../socket/packets/parties/parties.packets-receive';
import {
	PacketSendItems,
	PacketSendPartyUpdate
} from '../../../socket/packets/parties/parties.packets-send';
import {PlayerSocket} from '../../../socket/player-socket.interface';
import {RootGateway} from '../../../socket/root-gateway.class';
import {Hero} from '../common/models/hero/hero.model';
import {Party} from '../common/models/party/party.model';
import {ItemService} from '../common/services/item.service';
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
	async handlePartyInit(sender: PlayerSocket) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID];

			if (!player) return;

			const [heroes, party, items] = await Promise.all([player.getHeroes(), player.getParty(), player.getItems()]);

			const heroUpdatePack  = new PacketSendHeroUpdate(heroes),
			      partyUpdatePack = new PacketSendPartyUpdate(party),
			      itemsPack       = new PacketSendItems(items);

			PacketService.sendPacket(player, heroUpdatePack);
			PacketService.sendPacket(player, partyUpdatePack);
			PacketService.sendPacket(player, itemsPack);
		} catch (error) {
			console.log('handleMapInit error', error);
		}
	}

	@SubscribeMessage('equipItem')
	async handleEquipItem(sender: PlayerSocket, packet: PacketReceiveEquipItem) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID];

			if (!player) return;

			console.log('Equip packet', packet);

			const [hero, party]: [Hero, Party] = await Promise.all([await player.getHeroByID(packet.heroID), player.getParty()]),
			      item                         = await ItemService.getItem(packet.itemID);

			if (!hero) {
				console.warn('Tried to equip item on invalid hero: ' + packet.heroID);
				return;
			}

			if (!item) {
				console.warn('Tried to equip invalid item: ' + packet.itemID);
				return;
			}

			if (!party.hasItem(item)) {
				console.warn('Tried to equip non-held item: ' + packet.itemID);
				return;
			}

			if (!item.equipSlots || !item.equipSlots.includes(packet.slot)) {
				console.warn('Tried to equip item in wrong slot: ' + packet.itemID + ', ' + packet.slot);
				return;
			}

			party.removeItem(item);

			const equippedItem = hero.getItemIDInSlot(packet.slot);

			if (equippedItem) {
				party.addItem(await ItemService.getItem(equippedItem));
			}

			hero.setEquipSlot(item, packet.slot);

			console.log('Item equipped');

			await Promise.all([hero.save(), party.save()]);
		} catch (error) {
			console.log('handleEquipItem error', error);
		}
	}

	@SubscribeMessage('unequipItem')
	async handleUnequipItem(sender: PlayerSocket, packet: PacketReceiveUnequipItem) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID];

			if (!player) return;

			console.log('Unequip packet', packet);

			const [hero, party]: [Hero, Party] = await Promise.all([await player.getHeroByID(packet.heroID), player.getParty()]);

			const itemID = hero.getItemIDInSlot(packet.slot);

			if (!hero) {
				console.warn('Tried to equip item on invalid hero: ' + packet.heroID);
				return;
			}

			if (!itemID) {
				console.warn('Tried to unequip empty slot: ' + packet.slot);
				return;
			}

			const item = await ItemService.getItem(itemID);

			if (!item) {
				console.warn('Tried to unequip invalid item: ' + itemID);
				return;
			}

			hero.unsetEquipSlot(packet.slot);
			party.addItem(item);

			await Promise.all([hero.save(), party.save()]);
		} catch (error) {
			console.log('handleUnequipItem error', error, error.stack);
		}
	}

	@SubscribeMessage('useItem')
	async handleUseItem(sender: PlayerSocket, packet: PacketReceiveUseItem) {

	}
}