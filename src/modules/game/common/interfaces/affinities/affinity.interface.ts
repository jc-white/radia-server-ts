export interface IAffinity {
	name: string;
	statWeights?: {
		[stat: string]: number
	}
}

export interface IAffinityLevelList {
	[affinityID: string]: number;
}