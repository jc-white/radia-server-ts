import {Controller, Get} from '@nestjs/common';
import {HeroService} from '../common/services/hero.service';

@Controller('hero')
export class HeroController {
	constructor(private heroService: HeroService) {

	}
}