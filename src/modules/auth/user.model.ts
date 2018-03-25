import {Model} from 'objection';

export class User extends Model {
	static tableName: string = 'users';
	static idColumn: string = 'userID';

	userID: string;
	email: string;
	password: string;
}