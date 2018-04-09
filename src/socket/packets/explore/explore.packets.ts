import {GamePacket} from '../game-packet.interface';

export interface PLoadMap {
	id: string;
	tileset: string;
}

export class PacketLoadMap extends GamePacket<PLoadMap> {
	constructor(data: PLoadMap) {
		super('explore', 'loadMap', data);
	}
}