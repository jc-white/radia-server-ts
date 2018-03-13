import {Instance, ObjectID, Property} from 'iridium';
import {IStatList} from './stats.interface';
import {ISkillList} from '../skills/skills.interface';

export interface IBaseHeroDocument {
	heroID: string;
	userID: string;
	name: string;
	classID: number;
}

export class BaseHero extends Instance<IBaseHeroDocument, BaseHero> implements IBaseHeroDocument {
	@ObjectID _id: string;

	@Property(String) heroID: string;
	@Property(String) userID: string;
	@Property(String) name: string;
	@Property(Number) classID: number;

	@Property([{
		str: Number,
		int: Number,
		dex: Number,
		con: Number,
		luk: Number
	}], false) stats: IStatList;

	@Property(Object, false) skills: ISkillList;
}