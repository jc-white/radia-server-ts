export abstract class GamePacket<T> {
	eventHandler: string;
	eventType: string;
	data: T;

	protected constructor(eventHandler: string, eventType: string, data: T) {
		Object.assign(this, {
			eventHandler: eventHandler,
			eventType:    eventType,
			data:         data
		});
	}
}