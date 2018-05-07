import {Hero} from '../../../modules/game/common/models/hero/hero.model';
import {GamePacket} from '../game-packet.interface';

export class PacketSendHeroUpdate extends GamePacket<Array<Hero>> {
	constructor(heroes: Array<Hero>) {
		let _heroes = heroes.map(hero => hero.$toJson()) as Array<Hero>;
		super('heroes', 'heroUpdate', _heroes);
	}
}