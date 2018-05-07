import {EquipSlot, Item} from '../../../modules/game/common/models/items/item.model';
import {Party} from '../../../modules/game/common/models/party/party.model';
import {GamePacket} from '../game-packet.interface';

export class PacketSendPartyUpdate extends GamePacket<Party> {
	constructor(party: Party) {
		super('party', 'partyUpdate', party);
	}
}

export class PacketSendSetFatigue extends GamePacket<number> {
	constructor(fatigueValue: number) {
		super('party', 'setFatigue', fatigueValue);
	}
}

export class PacketSendItem extends GamePacket<Item> {
	constructor(item: Item) {
		super('party', 'item', item);
	}
}

export class PacketSendItems extends GamePacket<Array<Item>> {
	constructor(items: Array<Item>) {
		super('party', 'items', items);
	}
}