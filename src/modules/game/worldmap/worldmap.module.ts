import {Module} from '@nestjs/common';
import {WorldmapController} from './worldmap.controller';
import {TiledService} from './tiled.service';

@Module({
	controllers: [
		WorldmapController
	],
	components: [
		TiledService
	]
})
export class WorldmapModule {

}