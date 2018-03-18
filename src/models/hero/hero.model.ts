import {Document, model, Model} from 'mongoose';
import {EGender} from '../../shared/models/hero/hero-misc.enum';
import {IStatList} from '../../shared/models/hero/stats.interface';
import {HeroSchema} from './hero.schema';

export interface IHero extends Document {
	heroID: string;
	name: string;
	gender: EGender;
	backstoryID: string;
	traits: Array<string>;
	stats: IStatList;
	skills: {
		[skillName: string]: number;
	};
	vitality: {
		health: [number, number],
		stamina: [number, number],
		mana: [number, number]
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
	}
	getName: () => string;
}

export const Hero: Model<IHero> = model('Hero', HeroSchema);