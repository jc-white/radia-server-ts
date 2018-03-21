import {Document, Model} from 'mongoose';
import {arrayProp, instanceMethod, post, pre, prop, Typegoose} from 'typegoose';
import {MongooseInstance} from '../../../../server';
import {EGender} from '../../../../shared/models/hero/hero-misc.enum';
import {IStatList} from '../../../../shared/models/hero/stats.interface';

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

function ensureAllFields(hero: Hero) {
	const newInstance = new Hero();

	Object.keys(newInstance).forEach(field => {
		if (!hero[field]) {
			hero[field] = newInstance[field];
		}
	});
}

@post<Hero>('init', (result: Hero) => {
	try {
		ensureAllFields(result);
		result.calc();
	} catch (err) {
		console.log('Hero init err', err);
	}
})
export class Hero extends Typegoose {
	@prop() heroID: string;
	@prop() userID: string;
	@prop() name: string;
	@prop({enum: Object.values(EGender)}) gender: EGender;
	@prop() level: number    = 1;
	@prop() backstoryID: string;
	@arrayProp({items: String}) traits: Array<string>;
	@prop() stats: IStatList = {
		str: 5,
		int: 5,
		dex: 5,
		con: 5,
		luk: 5
	};
	@prop() skills: {
		[skillName: string]: number;
	};
	@prop() vitality: {
		health: [number, number],
		stamina: [number, number],
		mana: [number, number]
	}                        = {
		health:  [85, 85],
		stamina: [85, 85],
		mana:    [85, 85]
	};

	private _calculated: ICalculatedHeroFields;

	get calculated() {
		return this._calculated;
	}

	set calculated(calc: ICalculatedHeroFields) {
		this._calculated = calc;
	}

	@instanceMethod calc() {
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

			//Calculate vitality
			const statBonusMap = {
				health:  ['con', 3],
				mana:    ['int', 3],
				stamina: ['dex', 3]
			};

			Object.keys(statBonusMap).forEach(stat => {
				console.log('Calculating', stat);

				const bonusInfo = statBonusMap[stat];

				const statBonus       = this.stats[bonusInfo[0]] * 3,
				      currentPct      = this.vitality[stat][0] / this.vitality[stat][1],
				      newMaxValue     = this.vitality[stat][1] + statBonus,
				      newCurrentValue = Math.floor(newMaxValue * currentPct);

				Object.assign(calc.vitality, {
					[stat]: [newCurrentValue, newMaxValue]
				});
			});

			this.calculated = calc;
		} catch (err) {
			console.log('calc err', err);
			return null;
		}
	};
}

export const Heroes = new Hero().getModelForClass(Hero, {
	existingMongoose: MongooseInstance,
	schemaOptions:    {
		collection: 'heroes',
		minimize:   false,
		toObject:   {
			getters: true,
			virtuals: true,
			minimize: false
		}
	}
});