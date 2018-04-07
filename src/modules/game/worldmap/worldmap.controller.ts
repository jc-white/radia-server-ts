import {Controller, OnModuleInit} from '@nestjs/common';
import {TiledService} from './tiled.service';

@Controller('worldmap')
export class WorldmapController implements OnModuleInit {
	constructor(private tiledService: TiledService) {

	}

	onModuleInit() {
		this.tiledService.getTilemap('test');
	}
}