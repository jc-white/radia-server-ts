import {Model} from 'objection';
import {EGender} from '../../../../shared/models/hero/hero-misc.enum';
import {IStatList} from '../../../../shared/models/hero/stats.interface';
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
	};
}