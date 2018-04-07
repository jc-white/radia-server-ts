import {Party} from '../../../modules/game/models/party/party.model';
import {GamePacket} from '../game-packet.interface';

export class PacketPartyUpdate extends GamePacket<Party> {
	constructor(party: Party) {
		super('party', 'partyUpdate', party);
	}
}