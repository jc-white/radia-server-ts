import {ICoordPair} from '../../../modules/game/explore/interfaces/explore.interface';
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

export class PacketMoveSuccess extends GamePacket<Array<ICoordPair>> {
	constructor(data: Array<ICoordPair>) {
		super('explore', 'moveSuccess', data);
	}
}