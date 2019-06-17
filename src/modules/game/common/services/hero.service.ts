import {Component, OnModuleInit} from '@nestjs/common';
import {config} from '../../../../../config/config.local';
import {Utils} from '../../../../shared/functions/utils';
import {WeightedList} from '../../../../shared/functions/weighted';
import {Player} from '../../../../socket/player.class';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../chargen/chargen.interface';
import {BackstoriesDict} from '../dicts/backstories.dict';
import {expandTraitGroup, TraitsDictionary} from '../dicts/traits.dict';
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

		await this.generateHero('novice_explorer');
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
		let incompatTraitIDs = [];
		hero.traits = [];

		//Add backstory traits
		if (template.backstoryID) {
			const backstory = BackstoriesDict[template.backstoryID];

			if (backstory.traits) {
				incompatTraitIDs.push(...backstory.traits); //Mark backstory traits as incompatible so they don't get chosen by the weighted list

				//console.log('Traits after backstory', hero.traits);
			}
		}

		if (!_.isEmpty(template.traitPool)) {
			let traitPool        = Object.assign({}, template.traitPool);

			//Add guaranteed traits
			const guaranteedTraits = _.pickBy(traitPool, chance => chance == -1);

			if (!_.isEmpty(guaranteedTraits)) {
				const guaranteedTraitIDs = _.difference(Object.keys(guaranteedTraits), hero.traits); //Omits traits that the hero already has (via backstory) so we don't lose trait slots on duplicates

				if (guaranteedTraitIDs.length) {
					hero.traits.push(...guaranteedTraitIDs);

					//console.log('Traits after guaranteed', hero.traits);

					//Reduce maxTraits by this amount so we don't pull too many traits from the random pool
					template.maxTraits -= guaranteedTraitIDs.length;
				}
			}

			//Find incompatible traits from backstory/guaranteed traits
			if (hero.traits.length) {
				hero.traits.forEach(traitID => {
					let thisTrait = TraitsDictionary.find(trait => trait.traitID == traitID);

					if (thisTrait.incompatibleWith && thisTrait.incompatibleWith.length) {
						incompatTraitIDs.push(...thisTrait.incompatibleWith);
					}
				});

				//console.log('These traits are incompatible with existing traits', incompatTraitIDs);
			}

			const wl = new WeightedList<{ traitID: string, weight: number }>([]);

			//Add random traits
			Object.keys(traitPool).forEach(traitID => {
				//A colon denotes a trait group, so we should expand it and add its entries to this list
				if (traitID[0] == ':') {
					const traitsInGroup = expandTraitGroup(traitID);

					if (traitsInGroup.length) {
						traitsInGroup.forEach(t => wl.add({
							traitID: t,
							weight:  traitPool[traitID] //All entries in the group have the same weight
						}));
					}
				} else {
					wl.add({
						traitID: traitID,
						weight:  traitPool[traitID]
					});
				}
			});

			//Remove currently incompatible traits from the pool, or traits that were already chosen
			wl.removeBy(function (item: { traitID: string, weight: number }) {
				return incompatTraitIDs.indexOf(item.traitID) > -1 || hero.traits.indexOf(item.traitID) > -1;
			});

			const numTraitsToPull             = _.random(template.minTraits, Math.max(template.minTraits, template.maxTraits)),
			      pulledTraits: Array<string> = [];

			for (let x = 0; x < numTraitsToPull; x++) {
				const pulledTrait = wl.pull(true);

				//Remove traits incompatible with this trait from the pool so they don't get picked
				if (pulledTrait) {
					const thisTrait = TraitsDictionary.find(t => t.traitID == pulledTrait.traitID);

					if (thisTrait && thisTrait.incompatibleWith && thisTrait.incompatibleWith.length) {
						//If this trait is explicitly incompatible with other traits, remove those from the list
						thisTrait.incompatibleWith.forEach(incompatTraitID => {
							console.log(thisTrait.traitID + ': Removing incompat trait', incompatTraitID);
							wl.removeBy({
								traitID: incompatTraitID
							});
						});

						//Check if any traits are incompatible with this one and remove those traits too
						let incompat = TraitsDictionary.filter(t => Array.isArray(t.incompatibleWith) && t.incompatibleWith.indexOf(thisTrait.traitID) > -1).map(t => t.traitID);

						incompat.forEach(traitID => wl.removeBy({
							traitID: traitID
						}));
					}

					pulledTraits.push(pulledTrait.traitID);

					//console.log('Pushing ', pulledTrait.traitID);
				}
			}

			if (pulledTraits.length) {
				hero.traits.push(...pulledTraits);

				//console.log('Final traits', hero.traits);
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

		hero.name = this.generateHeroName('human', hero.gender);

		await hero.calc();

		return hero;
	}
}