import {Component, Global} from '@nestjs/common';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../../../shared/interfaces/chargen/chargen.interface';
import {Heroes} from '../../models/hero/hero.model';

@Global()
@Component()
export class HeroService {
	constructor(private db: DBService) {

	}

	getHeroes(userID: string) {
		return Heroes.find({
			userID: userID
		});
	}

	countHeroes(userID: string) {
		return Heroes.find({
			userID: userID
		}).exec();
	}

	async createHero(formData: IChargenFormData) {

	}
}