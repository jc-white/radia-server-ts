import {IVitality} from '../misc/vitality.interface';
import {ISkillLevelList} from '../skills/skills.interface';
import {IStatList} from './stats.interface';

export interface IBackstory {
	id: string;
	name: string;
	desc: string;
	traits: Array<string>;
}

export interface IEquipment {
	head: number;
	chest: number;
	legs: number;
	feet: number;
	hands: number;
	neck: number;
	finger: number;
	primary: number;
	secondary: number;
}

export interface IHeroTemplateEquipment {
	//      Keys are itemIDs and values are weights for weighted list
	head: {[itemID: number]: number};
	chest: {[itemID: number]: number};
	legs: {[itemID: number]: number};
	feet: {[itemID: number]: number};
	hands: {[itemID: number]: number};
	neck: {[itemID: number]: number};
	finger: {[itemID: number]: number};
	primary: {[itemID: number]: number};
	secondary: {[itemID: number]: number};
}

export interface IHeroTemplateTraitPool {
	//      Keys are traitIDs, and values are weights for weighted list
	[traitID: string]: number;
}

export interface IHeroTemplateAffinities {
	//      Keys are affinityIDs, and value[0] is the minimum and value[1] is the maximum
	[affinity: string]: [number, number];
}

export interface ICalculatedHeroFields {
	vitality: IVitality,
	stats: IStatList;
	skills: ISkillLevelList;
	traits: Array<string>;
	affinities: IAffinityLevelList;
}