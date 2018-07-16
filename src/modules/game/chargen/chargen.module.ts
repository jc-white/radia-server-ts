import {Module} from '@nestjs/common';
import {ChargenService} from './chargen.service';
import {ChargenController} from './chargen.controller';

@Module({
	controllers: [
		ChargenController
	],
	components: [
		ChargenService
	],
	exports: [
		ChargenService
	]
})
export class ChargenModule {
	constructor() {

	}
}