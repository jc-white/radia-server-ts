import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {DBModule} from './db/db.module';
import {GameSocketGateway} from './socket/socket.gateway';
import {GameModule} from './game/game.module';


@Module({
	modules:    [
		AuthModule,
		GameModule,
		DBModule
	],
	components: [
		GameSocketGateway
	]
})
export class ApplicationModule {
	constructor() {

	}
}

