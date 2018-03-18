import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {DBModule} from './db/db.module';
import {HeroService} from './game/common/services/hero.service';
import {PacketService} from './socket/packet.service';
import {PlayerService} from './socket/player.service';
import {GameSocketGateway} from './socket/socket.gateway';
import {GameModule} from './game/game.module';


@Module({
	modules:    [
		AuthModule,
		GameModule,
		DBModule
	],
	components: [
		GameSocketGateway,
		PlayerService,
		PacketService,
		HeroService
	]
})
export class ApplicationModule {
	constructor() {

	}
}

