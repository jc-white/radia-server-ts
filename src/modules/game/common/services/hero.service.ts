import {Component} from '@nestjs/common';
import {DBService} from '../../../db/db.service';
import {IChargenFormData} from '../../../../shared/interfaces/chargen/chargen.interface';

@Component()
export class HeroService {
	constructor(private db: DBService) {

	}

	async getHeroes(userID: string) {
		return this.db.gameDB.Heroes.find({
			userID: userID
		});
	}

	async createHero(formData: IChargenFormData) {

	}
}