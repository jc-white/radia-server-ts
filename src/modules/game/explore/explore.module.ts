import {Module} from '@nestjs/common';
import {TiledService} from './tiled.service';
import {ExploreGateway} from './explore.gateway';

@Module({
	controllers: [

	],
	components: [
		TiledService,
		ExploreGateway
	]
})
export class ExploreModule {
	constructor(private tiledService: TiledService) {
		(async () => {
			const tilemap = await tiledService.getTilemap('test');
		})();

	}
}