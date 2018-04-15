export const ResourcesDict = {
	gold: {
		max: 999999
	},

	wood: {
		max: 100
	},

	meals: {
		max: 100
	}
};

export type PartyResources = keyof typeof ResourcesDict;