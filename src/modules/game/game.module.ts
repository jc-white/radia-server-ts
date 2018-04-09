import {Global, Module} from '@nestjs/common';
import {ChargenModule} from "./chargen/chargen.module";
import {HeroService} from './common/services/hero.service';
import {PartyService} from './common/services/party.service';
import {PlayerService} from './common/services/player.service';
import {ExploreModule} from './explore/explore.module';

@Global()
@Module({
	imports: [
		ChargenModule,
		ExploreModule
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