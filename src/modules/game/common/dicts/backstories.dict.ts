import {IBackstory} from '../interfaces/hero/hero.interface';


export const BackstoriesDict: {
	[backstoryID: string]: IBackstory
} = {
	errandRunner: {
		id:     'errandRunner',
		name:   'Errand Runner',
		desc:   'You spent your childhood running errands for the rector of the local Mage\'s college. Although you were considered too low of birth to ever become a proper mage, ' +
		        'you stole glances at dusty tomes and magical artifacts in your free time, and even managed to teach yourself a cantrip or two before you were caught and released ' +
		        'from the college\'s service.',
		traits: [
			'studious',
			'spineless'
		]
	},

	streetUrchin: {
		id:     'streetUrchin',
		name:   'Street Urchin',
		desc:   'You whiled away the better part of your youth thieving from shops and nobles alike. Neither glistening apple nor silver wristwatch were safe from your grasp. ' +
		        'Though you never had the courage to attempt the bigger scores, you were satisfied with the living you made by filching low-value wares and trinkets.',
		traits: [
			'stickyfingers',
			'immoral'
		]
	},

	junkRat: {
		id:     'junkRat',
		name:   'Junk Rat',
		desc:   'You grew up amongst the filth and garbage of an industrial junkyard, where you learned how to tinker and construct useful tools and apparatuses. You were always considered ' +
		        'to be a little eccentric by your peers, however, and never quite learned how to socialize and fit in with the group.',
		traits: [
			'tinkerer',
			'awkward'
		]
	},

	pamperedChild: {
		id:     'pamperedChild',
		name:   'Pampered Child',
		desc:   'You were never allowed to stray far from your mother\'s gaze, and you never knew any better. Your meals were served on silver plates and your every want and whim was ' +
		        'catered by your live-in butler. You attended the best of private schools where you always took the spotlight. Although you never worked a day in your life, ' +
		        'you were better-prepared for adulthood than all of your peers.',
		traits: [
			'attractive',
			'puny'
		]
	},

	blacksmithApprentice: {
		id:     'blacksmithApprentice',
		name:   `Blacksmith's Apprentice`,
		desc:   'In your younger years, you worked as a blacksmith\'s apprentice in the back alleys of a bustling city. You weren\'t the fastest worker in the shop, so your daily ' +
		        'duties mostly consisted of fulfilling orders of trifling things such as bear traps and stakes. This lifestyle kept you in wonderful shape and from it you gained ' +
		        'a valuable sense of work ethic.',
		traits: [
			'ironborn',
			'slowlearner'
		]
	},

	squire: {
		id: 'squire',
		name: 'Squire',
		desc: 'You were raised with a sword in your hand, practicing in the castle courtyard daily with your trainer as well as your peers. Although you were never the best with the blade, ' +
		      'you never stopped training, hoping one day to prove yourself in order to become a full-fledged knight. You gained a sense of pride as well as combat aptitude from your ' +
		      'noble upbringing.',
		traits: [
			'swordsman',
			'arrogant'
		]
	}
};