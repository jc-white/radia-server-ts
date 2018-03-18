import {Global, Module} from '@nestjs/common';
import {DatabaseProviders} from './db.providers';
import {DBService} from './db.service';

@Global()
@Module({
	components: [
		...DatabaseProviders,
		DBService
	],
	exports:    [
		DBService
	]
})
export class DBModule {

}