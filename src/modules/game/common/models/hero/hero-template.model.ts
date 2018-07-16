import {Model} from 'objection';
import {
	IHeroTemplateAffinities,
	IHeroTemplateEquipment,
	IHeroTemplateTraitPool
} from '../../interfaces/hero/hero.interface';

export class HeroTemplate extends Model {
	static tableName: string = 'heroTemplates';
	static idColumn: string = 'heroTemplateID';

	heroTemplateID: string;
	minLevel: number;
	maxLevel: number;
	traitPool: IHeroTemplateTraitPool;
	backstoryID: string;
	equipment: IHeroTemplateEquipment;
	minTraits: number;
	maxTraits: number;
	affinities: IHeroTemplateAffinities;

	static findByTemplateID(heroTemplateID: string): Promise<HeroTemplate> {
		return this.query().where('heroTemplateID', heroTemplateID).first();
	}
}