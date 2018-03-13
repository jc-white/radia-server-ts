import {Module} from '@nestjs/common';
import {HeroService} from './common/services/hero.service';
import {ChargenModule} from "./chargen/chargen.module";

@Module({
	modules: [
		ChargenModule
	],
	components: [
		HeroService
	],
	exports: [
		HeroService
	]
})
export class GameModule {
	constructor() {

	}
}