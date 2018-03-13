export interface ITraitList {
	[string: string]: ITrait
}

export interface ITrait {
	traitID: string;
	desc: string;
	name: string;
	polarity: number;
	chargen: 0|1;
	skills?: Array<{
		skill: string,
		value: number
	}>,
	affinities?: Array<{
		affinity: string,
		value: number
	}>
}