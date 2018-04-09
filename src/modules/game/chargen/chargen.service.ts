import {Component} from '@nestjs/common';
import {IChargenFormData} from './chargen.interface';
import {Hero} from '../common/models/hero/hero.model';

@Component()
export class ChargenService {
	constructor() {

	}

	createHero(userID: number, formData: IChargenFormData) {
		return Hero.query().insert({
			userID:      userID,
			name:        formData.name,
			gender:      formData.gender,
			backstoryID: formData.backstoryID,
			traits:      formData.traitIDs,
			stats:       {
				str: 5,
				int: 5,
				dex: 5,
				con: 5,
				luk: 5
			}
		}).returning('*');
	}
}