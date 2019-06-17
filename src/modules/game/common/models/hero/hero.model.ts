import {Model} from 'objection';
import {WeightedList} from '../../../../../shared/functions/weighted';
import {AffinitiesDictionary} from '../../dicts/affinities.dict';
import {TraitsDictionary} from '../../dicts/traits.dict';
import {IAffinityLevelList} from '../../interfaces/affinities/affinity.interface';
import {EGender} from '../../interfaces/hero/hero-misc.enum';
import {ICalculatedHeroFields, IEquipment} from '../../interfaces/hero/hero.interface';
import {IStatList, VitTypes} from '../../interfaces/hero/stats.interface';
import {BackstoriesDict} from '../../dicts/backstories.dict';
import {IVitality} from '../../interfaces/misc/vitality.interface';
import {ISkillLevelList} from '../../interfaces/skills/skills.interface';
import {ItemService} from '../../services/item.service';
import {EquipSlot, Item} from '../items/item.model';
import * as _ from 'lodash';

export class Hero extends Model {
	static tableName: string                = 'heroes';
	static idColumn: string                 = 'heroID';
	static virtualAttributes: Array<string> = ['calculated'];

	$parseJson(json, opt) {
		json = super.$parseJson(json, opt);
		this.calc();

		return json;
	}

	async $afterGet() {
		await this.calc();
	}

	heroID: number                 = void 0;
	userID: number                 = null;
	name: string                   = null;
	gender: EGender                = 1;
	level: number                  = 1;
	backstoryID: string            = null;
	traits: Array<string>          = [];
	skills: ISkillLevelList        = {};
	stats: IStatList               = {
		str: 5,
		int: 5,
		dex: 5,
		con: 5,
		luk: 5
	};
	vitality: IVitality            = {
		health:  [85, 85],
		stamina: [85, 85],
		mana:    [85, 85]
	};
	equipment: Partial<IEquipment> = {};
	affinities: IAffinityLevelList = {};

	$calculated: ICalculatedHeroFields;

	get calculated() {
		return this.$calculated;
	}

	async calc() {
		try {
			const calc: ICalculatedHeroFields = {
				vitality:   {
					health:  [0, 0],
					stamina: [0, 0],
					mana:    [0, 0]
				},
				stats:      {
					str: 0,
					int: 0,
					dex: 0,
					con: 0,
					luk: 0
				},
				skills:     {},
				traits:     [],
				affinities: {}
			};

			//region Calculate vitality
			const statBonusMap = {
				health:  ['con', 3],
				mana:    ['int', 3],
				stamina: ['dex', 3]
			};

			Object.keys(statBonusMap).forEach(stat => {
				const bonusInfo = statBonusMap[stat];

				const statBonus       = this.stats[bonusInfo[0]] * 3,
				      currentPct      = this.vitality[stat][0] / this.vitality[stat][1],
				      newMaxValue     = this.vitality[stat][1] + statBonus,
				      newCurrentValue = Math.floor(newMaxValue * currentPct);

				Object.assign(calc.vitality, {
					[stat]: [newCurrentValue, newMaxValue]
				});
			});
			//endregion

			//region Basic stats
			Object.assign(calc.stats, this.stats);

			if (this.equipment && Object.values(this.equipment).length) {
				const items = await ItemService.getItems(Object.values(this.equipment));

				items.forEach(item => {
					if (item.stats) {
						Object.keys(item.stats).forEach(stat => {
							calc.stats[stat] += item.stats[stat];
						});
					}
				});
			}
			//endregion

			//region Traits
			Object.assign(calc.traits, this.traits);

			const backstory = BackstoriesDict[this.backstoryID];

			if (backstory) {
				if (backstory.traits) {
					calc.traits = calc.traits.concat(backstory.traits);
				}
			}
			//endregion

			//region Skills
			Object.assign(calc.skills, this.skills);

			calc.traits.forEach(traitID => {
				const trait = TraitsDictionary.find(t => t.traitID == traitID);

				if (Array.isArray(trait.skills)) {
					trait.skills.forEach(skill => {
						calc.skills[skill.skill] = (calc.skills[skill.skill] || 0) + skill.value
					});
				}
			});
			//endregion

			//region Affinities
			Object.assign(calc.affinities, this.affinities);

			if (calc.traits.length) {
				calc.traits.forEach(traitID => {
					const trait = TraitsDictionary.find(t => t.traitID == traitID);

					if (trait.affinities) {
						trait.affinities.forEach(affinityModifier => {
							calc.affinities[affinityModifier.affinity] = (calc.affinities[affinityModifier.affinity] || 0) + affinityModifier.value;
						});
					}
				});
			}
			//endregion

			this.$calculated = calc;
		} catch (err) {
			console.log('calc err', err);
			return null;
		}
	}

	save() {
		if (this.heroID) {
			return Hero.query().where('heroID', this.heroID).update(this.toJSON());
		}
	}

	//region Leveling
	levelUp() {
		let statWeights = {
			str: 10,
			int: 10,
			dex: 10,
			con: 10,
			luk: 3
		};

		if (this.calculated.affinities) {
			Object.keys(this.calculated.affinities).forEach(affinityID => {
				const affinityLevel = this.calculated.affinities[affinityID],
				      affinity      = AffinitiesDictionary[affinityID];

				if (!_.isEmpty(affinity.statWeights)) {
					//Loop through all the statWeight modifiers of the affinity and add them to the base weights
					Object.keys(affinity.statWeights).forEach(stat => {
						//We can't go below 1 for the weight. A stat can always be chosen in the level-up process, no matter the affinities.
						statWeights[stat] = Math.max(1, statWeights[stat] + (affinity.statWeights[stat] * affinityLevel));
					});
				}
			});
		}

		const wl = new WeightedList<{ stat: string, weight: number }>([]);

		Object.keys(statWeights).forEach(stat => {
			wl.add({
				stat:   stat,
				weight: statWeights[stat]
			});
		});

		for (let x = 0; x < 5; x++) {
			const opt = wl.pull();

			this.stats[opt.stat]++;
		}

		this.level++;
	}

	//endregion

	//region Vitality
	getCurrentVit(type: VitTypes) {
		return this.vitality[type][0];
	}

	getMaxVit(type: VitTypes) {
		return this.vitality[type][1];
	}

	getVitPct(type: VitTypes) {
		return this.getCurrentVit(type) / this.getMaxVit(type);
	}

	setCurrentVit(type: VitTypes, value: number) {
		this.vitality[type][0] = Math.min(value, this.getMaxVit(type));
	}

	setVitPct(type: VitTypes, pct: number) {
		if (pct > 1 || pct < 0) {
			console.error('healVitToPct: pct must be between 0 and 1');
			return;
		}

		this.setCurrentVit(type, Math.floor(this.getMaxVit(type) * pct));
	}

	healVitToPct(type: VitTypes, pct: number) {
		if (pct > 1 || pct < 0) {
			console.error('healVitToPct: pct must be between 0 and 1');
			return;
		}

		if (this.getCurrentVit(type) < Math.floor(this.getMaxVit(type) * pct)) {
			this.setVitPct(type, pct);
		}
	}

	healVitByPct(type: VitTypes, pct: number) {
		if (pct > 1 || pct < 0) {
			console.error('healVitToPct: pct must be between 0 and 1');
			return;
		}

		this.setCurrentVit(type, this.getCurrentVit(type) + Math.floor(this.getMaxVit(type) * pct));
	}

	healVitByAmount(type: VitTypes, amount: number) {
		this.setCurrentVit(type, this.getCurrentVit(type) + amount);
	}

	healVitToFull(type: VitTypes) {
		this.setVitPct(type, 1);
	}

	//endregion

	//region Equipment
	getItemIDInSlot(slot: EquipSlot): number {
		return this.equipment[slot];
	}

	setEquipSlot(item: Item, slot: EquipSlot) {
		this.equipment[slot] = item.itemID;
	}

	unsetEquipSlot(slot: EquipSlot) {
		this.equipment[slot] = undefined;
	}

	//endregion
}