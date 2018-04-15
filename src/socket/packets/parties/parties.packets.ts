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