import {GatewayMiddleware} from '@nestjs/websockets';
import {Middleware} from '@nestjs/common';
import * as _ from 'lodash';

@Middleware()
export class GameSocketAuthMiddleware implements GatewayMiddleware {
	public resolve(): (socket, next) => void {
		return function(socket, next) {
			console.log('Gateway middleware!');
			console.log('Next is function?', _.isFunction(next), next.name);
			next();
		}
	}
}