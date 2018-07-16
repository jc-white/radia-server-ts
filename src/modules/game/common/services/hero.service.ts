import {Component, OnModuleInit} from '@nestjs/common';
import {config} from '../../../../../config/config.local';
import {Utils} from '../../../../shared/functions/utils';
import {WeightedList} from '../../../../shared/functions/weighted';
import {Player} from '../../../../socket/player.class';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../chargen/chargen.interface';
import {BackstoriesDict} from '../dicts/backstories.dict';
import {EGender} from '../interfaces/hero/hero-misc.enum';
import {HeroTemplate} from '../models/hero/hero-template.model';
import {ItemService} from './item.service';
import {PacketService} from './packet.service';
import {PacketSendHeroUpdate} from '../../../../socket/packets/heroes/heroes.packets';
import {PlayerService} from './player.service';
import {Hero} from '../models/hero/hero.model';
import * as _ from 'lodash';
import * as path from 'path';
import * as moniker from 'moniker';

@Component()
export class HeroService implements OnModuleInit {
	constructor(private db: DBService, private playerService: PlayerService) {

	}

	async onModuleInit() {
		DBService.listen('heroes', async (data) => {
			const result = DBService.mapNotification<Hero>(data, new Hero());

			await Promise.all([result.old ? result.old.calc() : null, result.new ? result.new.calc() : null]);

			this.handleHeroChange(result.new);
		});

		await this.generateHero('test');
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

	generateHeroName(race: string = 'human', gender: EGender) {
		const dicts = [
			path.join(config.paths.nameDicts, `${race}-${EGender[gender].toLowerCase()}.pre.txt`),
			path.join(config.paths.nameDicts, `${race}-${EGender[gender].toLowerCase()}.post.txt`)
		];

		const generator = moniker.generator(dicts, {
			glue: '_'
		});

		return Utils.ucFirst(generator.choose().replace('_', ''));
	}

	async generateHero(heroTemplateID: string) {
		const template = await HeroTemplate.findByTemplateID(heroTemplateID);

		if (!template) {
			console.error('Tried to generate hero from bad template ID: ', heroTemplateID);
			return;
		}

		const backstory = BackstoriesDict[template.backstoryID];

		if (!backstory) {
			console.error('Tried to generate hero with bad backstory ID: ', template.backstoryID);
			return;
		}

		const hero = new Hero();

		hero.backstoryID = template.backstoryID;
		hero.gender      = _.random(EGender.Male, EGender.Female);

		//Equipment
		if (!_.isEmpty(template.equipment)) {
			//Loop through all the slots in the template's equipment
			Object.keys(template.equipment).forEach(slot => {
				const options = template.equipment[slot],
				      wl      = new WeightedList<{ itemID: number, weight: number }>([]);

				//Add all the possible items for this slot to the weighted list
				Object.keys(options).forEach(itemID => {
					wl.add({
						itemID: parseInt(itemID, 10),
						weight: options[itemID]
					});
				});

				//Draw an option for this slot
				const item = wl.pull();

				if (item) {
					hero.equipment[slot] = item.itemID;
				}
			});
		}

		//Traits
		if (!_.isEmpty(template.traitPool)) {
			const wl = new WeightedList<{ traitID: string, weight: number }>([]);

			Object.keys(template.traitPool).forEach(traitID => {
				wl.add({
					traitID: traitID,
					weight:  template.traitPool[traitID]
				});
			});

			const traits = wl.pullMultiple(_.random(template.minTraits, Math.min(template.maxTraits, Object.keys(template.traitPool).length)));

			if (traits.length) {
				hero.traits = traits.map(t => t.traitID);
			}
		}

		//Affinities
		if (!_.isEmpty(template.affinities)) {
			Object.keys(template.affinities).forEach(affinity => {
				const range = template.affinities[affinity];

				const lowerRange = _.clamp(range[0], -10, 10),
				      upperRange = _.clamp(range[1], lowerRange, 10);

				hero.affinities[affinity] = _.random(lowerRange, upperRange);
			});
		}

		await hero.calc();

		const levelUpTo = _.random(template.minLevel, Math.max(template.maxLevel, template.minLevel));

		for (let x = 0; x < levelUpTo; x++) {
			hero.levelUp();
		}

		hero.name       = this.generateHeroName('human', hero.gender);

		console.log('Generated hero');

		await hero.calc();

		console.log(hero);
	}
}