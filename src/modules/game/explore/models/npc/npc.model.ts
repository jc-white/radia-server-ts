import {Model} from 'objection';
import {IVitality} from '../../../common/interfaces/misc/vitality.interface';
import {ISkillLevelList} from '../../../common/interfaces/skills/skills.interface';

export class NPC extends Model {
	static tableName: string = 'npcs';
	static idColumn: string = 'npcID';

	npcID: number;
	npcTypes: Array<string>;
	name: string;
	level: number;
	skills: ISkillLevelList;
	vitality: IVitality;
	battleIcon: string;
	lootGroups: Array<string>;
	isActive: boolean;

	static findByID(npcID: number) {
		return this.query().where('npcID', npcID).first();
	}
}