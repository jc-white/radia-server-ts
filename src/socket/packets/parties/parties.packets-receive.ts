import {EquipSlot} from '../../../modules/game/common/models/items/item.model';

export interface PacketReceiveEquipItem {
	itemID: number;
	heroID: number;
	slot: EquipSlot;
}

export interface PacketReceiveUnequipItem {
	heroID: number;
	slot: EquipSlot;
}

export interface PacketReceiveUseItem {
	itemID: number;
	heroID?: number;
}