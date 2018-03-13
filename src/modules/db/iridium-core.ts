import {Core, Model} from 'iridium';
import {config} from '../../../config/config.local';
import {Hero} from '../../models/hero/hero.model';
import {IBaseHeroDocument} from '../../shared/models/hero/hero.model';
import {IUserDocument, User} from '../../shared/models/user/user.model';

export class GameDBCore extends Core {
	Users = new Model<IUserDocument, User>(this, User);
	Heroes = new Model<IBaseHeroDocument, Hero>(this, Hero);

	constructor() {
		super(config.mongo.uri, { database: 'radia' });
	}
}

export const GameDB = new GameDBCore();