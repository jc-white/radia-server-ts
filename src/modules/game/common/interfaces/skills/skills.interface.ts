export interface ISkillList {
	[string: string]: ISkill
}

export interface ISkill {
	name: string;
	desc: string;
}

export interface ISkillLevelList {
	[skillID: string]: number;
}