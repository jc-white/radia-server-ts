import {Component} from '@nestjs/common';
import {DBService} from '../../db/db.service';
import {HeroService} from '../common/services/hero.service';

@Component()
export class ChargenService {
	constructor(private heroService: HeroService, private db: DBService) {

	}

	getBackstories() {
		return [];
	}

	getBackstoryByID(backstoryID: string) {
		return {};
	}
}