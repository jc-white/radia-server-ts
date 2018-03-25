import {Module} from '@nestjs/common';
import {HeroService} from '../services/hero.service';
import {ChargenService} from './chargen.service';
import {ChargenController} from './chargen.controller';

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