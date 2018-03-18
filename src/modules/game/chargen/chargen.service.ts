import {Component} from '@nestjs/common';
import {Hero} from '../../../models/hero/hero.model';
import {IChargenFormData} from '../../../shared/interfaces/chargen/chargen.interface';
import * as shortid from 'shortid';

@Component()
export class ChargenService {
	constructor() {

	}

	createHero(userID: string, formData: IChargenFormData) {
		return Hero.create({
			heroID:      shortid.generate(),
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
		});
	}
}