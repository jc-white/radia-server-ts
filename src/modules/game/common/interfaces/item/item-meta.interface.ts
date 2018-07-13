import {VitTypes} from '../hero/stats.interface';

export type ItemMetaHealing = {
	[vitType in VitTypes]: number
}