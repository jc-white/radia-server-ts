import {Module} from '@nestjs/common';
import {PartyGateway} from './party.gateway';

@Module({
	components: [
		PartyGateway
	]
})
export class PartyModule {

}