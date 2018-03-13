import {Collection, Index} from 'iridium';
import {BaseHero, IBaseHeroDocument} from '../../shared/models/hero/hero.model';

@Index({ name: 1 })
@Collection('heroes')
export class Hero extends BaseHero implements IBaseHeroDocument {

}