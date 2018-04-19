import {Item} from '../../../modules/game/common/models/items/item.model';
import {Party} from '../../../modules/game/common/models/party/party.model';
import {GamePacket} from '../game-packet.interface';

export class PacketPartyUpdate extends GamePacket<Party> {
	constructor(party: Party) {
		super('party', 'partyUpdate', party);
	}
}

export class PacketSetFatigue extends GamePacket<number> {
	constructor(fatigueValue: number) {
		super('party', 'setFatigue', fatigueValue);
	}
}

export class PacketItem extends GamePacket<Item> {
	constructor(item: Item) {
		super('party', 'item', item);
	}
}

export class PacketItems extends GamePacket<Array<Item>> {
	constructor(items: Array<Item>) {
		super('party', 'items', items);
	}
}