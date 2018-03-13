import {Module} from '@nestjs/common';
import {ChargenService} from './chargen.service';
import {ChargenController} from './chargen.controller';
import {HeroService} from '../common/services/hero.service';

@Module({
	controllers: [
		ChargenController
	],
	components: [
		ChargenService,
		HeroService
	],
	exports: [
		ChargenService
	]
})
export class ChargenModule {
	constructor() {

	}
}