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