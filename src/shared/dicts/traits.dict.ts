import {ITrait, ITraitList} from '../models/traits/traits.interface';

export const TraitsDictionary: Array<ITrait> = [
	{
		traitID:    'fit',
		name:       'Physically Fit',
		desc:       'You are more likely to succeed at physical tasks and able to learn skills requiring considerable brawn.',
		polarity:   1,
		chargen:    0,
		skills:     [
			{
				skill: 'athletics',
				value: 1
			}
		],
		affinities: [
			{
				affinity: 'brawn',
				value:    1
			},
			{
				affinity: 'combat',
				value:    1
			}
		]
	},

	{
		traitID:    'slowlearner',
		name:       'Slow Learner',
		desc:       'You learn skills somewhat more slowly than others.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'learning',
				value:    -1
			}
		]
	},

	{
		traitID:    'studious',
		name:       'Studious',
		desc:       'You learn skills more quickly than others and are able to more easily digest new information and unfamiliar situations.',
		polarity:   1,
		chargen:    0,
		skills:     [
			{
				skill: 'insight',
				value: 1
			}
		],
		affinities: [
			{
				affinity: 'learning',
				value:    2
			}
		]
	},

	{
		traitID:    'arrogant',
		name:       'Arrogant',
		desc:       'Your arrogance often rubs people the wrong way, and may occasionally land you into trouble.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'charisma',
				value:    -2
			}
		]
	},

	{
		traitID:    'awkward',
		name:       'Awkward',
		desc:       'You are somewhat socially inept and have a tougher time conversing with others.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'speechcraft',
				value:    -1
			}
		]
	},

	{
		traitID:    'immoral',
		name:       'Immoral',
		desc:       'Your questionable morals open avenues to equally immoral skills and solutions to your problems, but may rub people the wrong way.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'charisma',
				value:    -2
			}
		]
	},

	{
		traitID:    'spineless',
		name:       'Spineless',
		desc:       'You often lack the confidence and willpower to overcome very intense or dangerous situations.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'fortitude',
				value:    -1
			}
		]
	},

	{
		traitID:    'attractive',
		name:       'Attractive',
		desc:       'Your dashing good looks can often assist you where skill can not.',
		polarity:   1,
		chargen:    0,
		affinities: [
			{
				affinity: 'speechcraft',
				value:    1
			},
			{
				affinity: 'charisma',
				value:    2
			}
		]
	},

	{
		traitID:    'nimble',
		name:       'Nimble',
		desc:       'You are fleet of foot and able to more easily avoid attacks.',
		polarity:   1,
		chargen:    1,
		skills:     [
			{
				skill: 'acrobatics',
				value: 1
			}
		],
		affinities: [
			{
				affinity: 'evasiveness',
				value:    2
			}
		]
	},

	{
		traitID:  'ironborn',
		name:     'Ironborn',
		desc:     'You are naturally talented in the fields of blacksmithing and melee combat.',
		polarity: 1,
		chargen:  0,
		skills:   [
			{
				skill: 'smithing',
				value: 2
			},
			{
				skill: 'melee',
				value: 1
			}
		]
	},

	{
		traitID:    'stickyfingers',
		name:       'Sticky Fingers',
		desc:       'You are naturally gifted at picking pockets and filching small wares.',
		polarity:   1,
		chargen:    0,
		skills:     [
			{
				skill: 'thievery',
				value: 2
			}
		],
		affinities: [
			{
				affinity: 'evasiveness',
				value:    1
			}
		]
	},

	{
		traitID:    'puny',
		name:       'Puny',
		desc:       'You are rather unskilled in matters of combat and physical prowess.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'brawn',
				value:    -1
			},
			{
				affinity: 'combat',
				value:    -1
			}
		]
	},

	{
		traitID:  'tinkerer',
		name:     'Tinkerer',
		desc:     'You are naturally gifted in tinkering and engineering.',
		polarity: 1,
		chargen:  0,
		skills:   [
			{
				skill: 'engineering',
				value: 2
			},
			{
				skill: 'handcrafting',
				value: 1
			}
		]
	},

	{
		traitID:  'handy',
		name:     'Handy',
		desc:     'You have a penchant for fixing and improving small tools and devices.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'handcrafting',
				value: 1
			}
		]
	},

	{
		traitID:  'clearmind',
		name:     'Clear of Mind',
		desc:     'You are able to think clearly even under duress, and better at assessing dangerous situations than most.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'insight',
				value: 1
			}
		]
	},

	{
		traitID:  'mender',
		name:     'Mender',
		desc:     'You have some experience in curatives and treating the wounded.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'surgeon',
				value: 2
			}
		]
	},

	{
		traitID:  'prospector',
		name:     'Prospector',
		desc:     'You have a trained eye for things that hold value, no matter how little.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'appraisal',
				value: 2
			}
		]
	},

	{
		traitID:  'fearless',
		name:     'Fearless',
		desc:     'Delving into the deepest of dungeons appeals to you more than most.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'dungeoneering',
				value: 2
			}
		]
	},

	{
		traitID:  'animalfriend',
		name:     'Animal Friend',
		desc:     'You have a natural ability to communicate with animals on a primal level.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'animal',
				value: 2
			}
		]
	},

	{
		traitID:  'fugitive',
		name:     'Fugitive',
		desc:     `You've been on the lam for as long as you can remember. What crime did you commit again?`,
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'escape',
				value: 2
			}
		]
	},

	{
		traitID:  'honest',
		name:     'Honest',
		desc:     'You are incapable of telling lies. However, you may occasionally be rewarded for your honesty.',
		polarity: 0,
		chargen:  1
	},

	{
		traitID:    'charming',
		name:       'Charming',
		desc:       'People are a little more enamored with you for no apparent reason.',
		polarity:   1,
		chargen:    1,
		affinities: [
			{
				affinity: 'charisma',
				value:    1
			}
		]
	},

	{
		traitID:    'drinker',
		name:       'Heavy Drinker',
		desc:       'You can hold your alcohol better than most.',
		polarity:   1,
		chargen:    1,
		affinities: [
			{
				affinity: 'alcohol',
				value:    3
			}
		]
	},

	{
		traitID:    'deadeye',
		name:       'Dead Eye',
		desc:       'Great aim is the name of the game.',
		polarity:   1,
		chargen:    1,
		affinities: [
			{
				affinity: 'accuracy',
				value:    2
			}
		]
	},

	{
		traitID:  'explorer',
		name:     'Explorer',
		desc:     'You are more in-tune with nature than most and know how to live off the land.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'exploration',
				value: 2
			}
		]
	},

	{
		traitID:    'barbaric',
		name:       'Barbaric',
		desc:       `You don't always know if your attacks are going to land, but when they do, they're guaranteed to hurt.`,
		polarity:   0,
		chargen:    1,
		affinities: [
			{
				affinity: 'combat',
				value:    2
			},
			{
				affinity: 'accuracy',
				value:    -2
			}
		]
	},

	{
		traitID:  'leader',
		name:     'Natural Leader',
		desc:     'Your followers become more experienced more quickly as a result of your great leadership.',
		polarity: 1,
		chargen:  1
	},

	{
		traitID:  'pennywise',
		name:     'Penny-wise',
		desc:     'You understand the value of money more than most, and gain a little more of it from every source.',
		polarity: 1,
		chargen:  1
	},

	{
		traitID:    'bastard',
		name:       'Bastard',
		desc:       'You never let anyone use your heritage (or lack thereof) against you.',
		polarity:   0,
		chargen:    1,
		affinities: [
			{
				affinity: 'charisma',
				value:    -1
			},
			{
				affinity: 'fortitude',
				value:    1
			}
		]
	},

	{
		traitID:  'plunderer',
		name:     'Plunderer',
		desc:     'Where others have stopped looking, you continue to find additional treasure.',
		polarity: 1,
		chargen:  1
	},

	{
		traitID:    'fatefavored',
		name:       `Fate's Favored`,
		desc:       'You are just naturally a little more lucky than others.',
		polarity:   1,
		chargen:    1,
		affinities: [
			{
				affinity: 'luck',
				value:    2
			}
		]
	},

	{
		traitID:  'swordsman',
		name:     'Swordsman',
		desc:     'You are fairly adept with a sword and other bladed weapons.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'melee',
				value: 2
			}
		]
	},

	{
		traitID:  'marksman',
		name:     'Marksman',
		desc:     'You are fairly adept with bows and other ranged weapons.',
		polarity: 1,
		chargen:  1,
		skills:   [
			{
				skill: 'ranged',
				value: 2
			}
		]
	},

	{
		traitID:    'coward',
		name:       'Coward',
		desc:       'You are deathly afraid of combat and only fight when absolutely necessary.',
		polarity:   -1,
		chargen:    0,
		affinities: [
			{
				affinity: 'combat',
				value:    -2
			}
		]
	},

	{
		traitID:    'pacifist',
		name:       'Pacifist',
		desc:       'You despise combat in all its forms.',
		polarity:   1,
		chargen:    0,
		affinities: [
			{
				affinity: 'combat',
				value:    -10
			}
		]
	},

	{
		traitID:  'lightsleeper',
		name:     'Light Sleeper',
		desc:     'You sleep with one eye open (literally). You are less likely to be attacked in the wilderness or while camping.',
		polarity: 1,
		chargen:  1
	}
];