import {Component} from '@nestjs/common';
import {IChargenFormData} from '../../../shared/interfaces/chargen/chargen.interface';
import * as shortid from 'shortid';
import {Heroes} from '../models/hero/hero.model';

@Component()
export class ChargenService {
	constructor() {

	}

	createHero(userID: string, formData: IChargenFormData) {
		return Heroes.create({
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