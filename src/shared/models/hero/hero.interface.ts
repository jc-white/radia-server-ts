export interface IBackstory {
	id: string;
	name: string;
	desc: string;
	traits: Array<string>;
	skills: {
		[name: string]: number
	}
}