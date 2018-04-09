import {Component, Global, OnModuleInit} from '@nestjs/common';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../chargen/chargen.interface';
import {PacketService} from './packet.service';
import {PacketHeroUpdate} from '../../../../socket/packets/heroes/heroes.packets';
import {PlayerService} from './player.service';
import {Hero} from '../models/hero/hero.model';

@Component()
export class HeroService implements OnModuleInit {
	constructor(private db: DBService, private playerService: PlayerService) {

	}

	onModuleInit() {
		DBService.listen('heroes', (data) => {
			const result = DBService.mapNotification<Hero>(data, new Hero(true));

			this.handleHeroChange(result.new);
		});
	}

	static async getHeroes(userID: number, asJSON: boolean = false) {
		const heroes = await Hero.query().where('userID', userID);

		return asJSON ? heroes.map(hero => hero.$toJson() as Hero) : heroes;
	}

	async createHero(formData: IChargenFormData) {

	}

	async handleHeroChange(hero: Hero) {
		const player = this.playerService.players[hero.userID];

		if (player) {
			PacketService.sendPacket(player, new PacketHeroUpdate([hero]));
		}
	}
}