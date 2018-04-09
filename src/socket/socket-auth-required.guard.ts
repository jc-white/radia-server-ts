import {CanActivate, ExecutionContext, Guard} from '@nestjs/common';

@Guard()
export class SocketAuthRequired implements CanActivate {
	public canActivate(data, context: ExecutionContext): boolean {
		return true;
	}
}