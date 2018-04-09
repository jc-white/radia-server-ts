import {Hero} from '../../../modules/game/common/models/hero/hero.model';
import {GamePacket} from '../game-packet.interface';

export class PacketHeroUpdate extends GamePacket<Array<Hero>> {
	constructor(heroes: Array<Hero>) {
		super('heroes', 'heroUpdate', heroes);
	}
}