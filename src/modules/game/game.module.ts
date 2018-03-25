import {Global, Module} from '@nestjs/common';
import {ChargenModule} from "./chargen/chargen.module";
import {HeroService} from './services/hero.service';
import {PlayerService} from './services/player.service';

@Global()
@Module({
	imports: [
		ChargenModule
	],
	components: [
		HeroService,
		PlayerService
	],
	exports: [
		HeroService,
		PlayerService
	]
})
export class GameModule {
	constructor() {

	}
}