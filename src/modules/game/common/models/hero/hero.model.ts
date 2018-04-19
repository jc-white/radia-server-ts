import {Model} from 'objection';
import {EGender} from '../../interfaces/hero/hero-misc.enum';
import {IStatList, VitTypes} from '../../interfaces/hero/stats.interface';
import {BackstoriesDict} from '../../dicts/backstories.dict';

export interface ICalculatedHeroFields {
	vitality: {
		health: [number, number],
		stamina: [number, number],
		mana: [number, number]
	},
	stats: IStatList;
	skills: {
		[skillName: string]: number;
	};
	traits: Array<string>;
}

export class Hero extends Model {
	static tableName: string                = 'heroes';
	static idColumn: string                 = 'heroID';
	static virtualAttributes: Array<string> = ['calculated'];

	$parseJson(json, opt) {
		json = super.$parseJson(json, opt);
		this.calc();

		return json;
	}

	$afterGet() {
		this.calc();
	}

	heroID: number        = void 0;
	userID: number        = null;
	name: string          = null;
	gender: EGender       = 1;
	level: number         = 1;
	backstoryID: string   = null;
	traits: Array<string> = [];
	skills: {
		[skillName: string]: number;
	}                     = {};
	stats: IStatList      = {
		str: 5,
		int: 5,
		dex: 5,
		con: 5,
		luk: 5
	};
	vitality: {
		health: [number, number],
		stamina: [number, number],
		mana: [number, number]
	}                     = {
		health:  [85, 85],
		stamina: [85, 85],
		mana:    [85, 85]
	};
	equipment: {
		[slot: string]: number
	} = {};

	$calculated: ICalculatedHeroFields;

	get calculated() {
		return this.$calculated;
	}

	constructor(isDummy: boolean = false) {
		super();
	}

	calc() {
		try {
			const calc: ICalculatedHeroFields = {
				vitality: {
					health:  [0, 0],
					stamina: [0, 0],
					mana:    [0, 0]
				},
				stats:    {
					str: 0,
					int: 0,
					dex: 0,
					con: 0,
					luk: 0
				},
				skills:   {},
				traits:   []
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

			//region Backstory traits
			const backstory = BackstoriesDict[this.backstoryID];

			if (backstory && backstory.traits) {
				calc.traits = calc.traits.concat(backstory.traits);
			}
			//endregion

			this.$calculated = calc;
		} catch (err) {
			console.log('calc err', err);
			return null;
		}
	}

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
}