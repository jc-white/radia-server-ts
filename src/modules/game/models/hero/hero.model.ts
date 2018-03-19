import {arrayProp, instanceMethod, post, prop, Typegoose} from 'typegoose';
import {MongooseInstance} from '../../../../server';
import {EGender} from '../../../../shared/models/hero/hero-misc.enum';
import {IStatList} from '../../../../shared/models/hero/stats.interface';

@post<Hero>('init', (result) => {
	result.calculateAll.call(result);
})
export class Hero extends Typegoose {
	@prop() heroID: string;
	@prop() userID: string;
	@prop() name: string;
	@prop({enum: Object.values(EGender)}) gender: EGender;
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
	        calculated: {
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
	        };

	@instanceMethod
	calculateAll() {
		console.log('calculateAll called');

		this.calculated = {
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

			Object.assign(this.calculated.vitality, {
				[stat]: [newCurrentValue, newMaxValue]
			});
		});

		console.log(this.calculated);

		//Calculate traits

		//Calculate skills
	}
}

export const Heroes = new Hero().getModelForClass(Hero, {
	existingMongoose: MongooseInstance,
	schemaOptions:    {
		collection: 'heroes'
	}
});