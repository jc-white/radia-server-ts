import {Global, Module} from '@nestjs/common';
import {ChargenModule} from "./chargen/chargen.module";
import {HeroService} from './services/hero.service';
import {PartyService} from './services/party.service';
import {PlayerService} from './services/player.service';
import {WorldmapModule} from './worldmap/worldmap.module';

@Global()
@Module({
	imports: [
		ChargenModule,
		WorldmapModule
	],
	components: [
		HeroService,
		PartyService,
		PlayerService
	],
	exports: [
		HeroService,
		PartyService,
		PlayerService
	]
})
export class GameModule {
	constructor() {

	}
}