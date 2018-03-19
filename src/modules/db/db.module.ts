import {Global, Module} from '@nestjs/common';
import {DBService} from './db.service';

@Global()
@Module({
	components: [
		DBService
	],
	exports:    [
		DBService
	]
})
export class DBModule {

}