import {Component, OnModuleInit} from '@nestjs/common';
import {Player} from '../../../../socket/player.class';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../chargen/chargen.interface';
import {ItemService} from './item.service';
import {PacketService} from './packet.service';
import {PacketSendHeroUpdate} from '../../../../socket/packets/heroes/heroes.packets';
import {PlayerService} from './player.service';
import {Hero} from '../models/hero/hero.model';
import * as _ from 'lodash';

@Component()
export class HeroService implements OnModuleInit {
	constructor(private db: DBService, private playerService: PlayerService) {

	}

	onModuleInit() {
		DBService.listen('heroes', async (data) => {
			const result = DBService.mapNotification<Hero>(data, new Hero());

			await Promise.all([result.old ? result.old.calc() : null, result.new ? result.new.calc() : null]);

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
		const player: Player = this.playerService.players[hero.userID];

		if (player) {
			//Check if any items need to be sent to the client
			const existingHero = await player.getHeroByID(hero.heroID);

			if (existingHero) {
				if (hero.equipment && !_.isEqual(hero.equipment, existingHero.equipment)) {
					const newItems = _.difference(Object.values(hero.equipment), Object.values(existingHero.equipment));

					newItems.forEach(itemID => {
						ItemService.sendItemToClient(player, itemID);
					});
				}
			}

			PacketService.sendPacket(player, new PacketSendHeroUpdate([hero]));

			player.updateHero(hero);
		}
	}
}