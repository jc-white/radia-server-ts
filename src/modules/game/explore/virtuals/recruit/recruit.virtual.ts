import {Hero} from '../../../common/models/hero/hero.model';

export class RecruitVirtual {
	generatedHero: Hero;
	name: string;
	heroTemplateID: string;
	mapID: string;
	x: number;
	y: number;

	constructor() {

	}

	setGeneratedHero(hero: Hero) {
		this.generatedHero = hero;
		this.name          = hero.name;
	}
}