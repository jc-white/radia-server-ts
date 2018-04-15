export interface ICoordPair {
	x: number;
	y: number;
}

export interface IPartyLocation {
	map: {
		mapID: string;
		name: string;
	}
	region: {
		regionID: string;
		name: string;
	}
}