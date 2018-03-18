export class GamePacket<T extends {}> {
	eventHandler: string;
	eventType: string;
	packet: T;

	constructor(eventHandler: string, eventType: string, data: T) {
		Object.assign(this, {
			eventHandler: eventHandler,
			eventType:    eventType,
			data:         data
		});
	}
}