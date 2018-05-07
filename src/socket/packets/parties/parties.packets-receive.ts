import {EquipSlot} from '../../../modules/game/common/models/items/item.model';

export interface PacketReceiveEquipItem {
	itemID: number;
	heroID: number;
	slot: EquipSlot;
}