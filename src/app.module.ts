import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {DBModule} from './modules/db/db.module';
import {GameSocketGateway} from './socket/socket.gateway';
import {GameModule} from './modules/game/game.module';

@Module({
	imports:    [
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

