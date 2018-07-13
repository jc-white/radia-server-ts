import {ICoordPair} from '../../../modules/game/explore/interfaces/explore.interface';
import {SpawnVirtual} from '../../../modules/game/explore/virtuals/spawn.virtual';
import {GamePacket} from '../game-packet.interface';

export interface IPacketSendLoadMap {
	id: string;
	tileset: string;
}

export class PacketSendLoadMap extends GamePacket<IPacketSendLoadMap> {
	constructor(data: IPacketSendLoadMap) {
		super('explore', 'loadMap', data);
	}
}

export class PacketSendMoveSuccess extends GamePacket<Array<ICoordPair>> {
	constructor(data: Array<ICoordPair>) {
		super('explore', 'moveSuccess', data);
	}
}

export class PacketSendSpawns extends GamePacket<Array<SpawnVirtual>> {
	constructor(data: Array<SpawnVirtual>) {
		super('explore', 'receiveSpawns', data);
	}
}