import {Component, Global} from '@nestjs/common';
import {Hero} from '../../../../models/hero/hero.model';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../../../shared/interfaces/chargen/chargen.interface';

@Global()
@Component()
export class HeroService {
	constructor(private db: DBService) {

	}

	getHeroes(userID: string) {
		return Hero.find({
			userID: userID
		});
	}

	countHeroes(userID: string) {
		return this.db.model.Hero.count({
			userID: userID
		});
	}

	async createHero(formData: IChargenFormData) {

	}
}