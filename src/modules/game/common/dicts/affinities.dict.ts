import {IAffinity} from '../interfaces/affinities/affinity.interface';

export const AffinitiesDictionary: {
	[affinityID: string]: IAffinity
} = {
	brawn: {
		name:  'Brawn',
		statWeights: {
			str: 1,
			con: 1
		}
	},

	combat: {
		name:  'Combat Ability',
		statWeights: {
			str: 1,
			dex: 1
		}
	},

	arcane: {
		name:  'Arcane Ability',
		statWeights: {
			int: 1
		}
	},

	learning: {
		name:  'Learning Ability',
		statWeights: {
			int: 2
		}
	},

	luck: {
		name:  'Luck',
		statWeights: {
			luk: 1
		}
	},

	alcohol: {
		name: 'Alcohol Tolerance'
	},

	evasiveness: {
		name:  'Evasiveness',
		statWeights: {
			dex: 2
		}
	},

	accuracy: {
		name:  'Accuracy',
		statWeights: {
			dex: 1
		}
	},

	charisma: {
		name: 'Charisma'
	},

	fortitude: {
		name:  'Fortitude',
		statWeights: {
			con: 2
		}
	},

	speechcraft: {
		name: 'Speechcraft'
	}
};