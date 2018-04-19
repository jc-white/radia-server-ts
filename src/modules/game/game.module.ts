import {Global, Module} from '@nestjs/common';
import {ChargenModule} from "./chargen/chargen.module";
import {HeroService} from './common/services/hero.service';
import {LocationService} from './common/services/location-service.component';
import {PartyService} from './party/party.service';
import {PlayerService} from './common/services/player.service';
import {ExploreModule} from './explore/explore.module';
import {TiledService} from './explore/tiled.service';
import {PartyModule} from './party/party.module';

@Global()
@Module({
	imports: [
		ChargenModule,
		ExploreModule,
		PartyModule
	],
	components: [
		HeroService,
		PartyService,
		PlayerService,
		LocationService,
		TiledService
	],
	exports: [
		HeroService,
		PartyService,
		PlayerService,
		LocationService,
		TiledService
	]
})
export class GameModule {
	constructor() {

	}
}