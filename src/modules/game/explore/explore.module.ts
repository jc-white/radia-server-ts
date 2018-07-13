import {Module} from '@nestjs/common';
import {SpawnService} from './spawn.service';
import {TiledService} from './tiled.service';
import {ExploreGateway} from './explore.gateway';

@Module({
	controllers: [

	],
	components: [
		TiledService,
		SpawnService,
		ExploreGateway
	]
})
export class ExploreModule {
	constructor(private tiledService: TiledService, private spawnService: SpawnService) {
		(async () => {
			//const tilemap = await tiledService.getTilemap('test');

			this.spawnService.buildSpawnGroupCache();
		})();

	}
}