import {Model} from 'objection';

export class RecruitGroup extends Model {
	static tableName: string = 'recruitGroups';
	static idColumn: string = 'recruitGroupID';

	recruitGroupID: string;
	heroTemplates: {
		[heroTemplateID: string]: number //the value is the weight of this template for a weighted list
	};
}