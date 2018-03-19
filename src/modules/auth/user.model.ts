import {prop, Typegoose} from 'typegoose';
import {MongooseInstance} from '../../server';

export class User extends Typegoose {
	@prop() userID: string;
	@prop() email: string;
	@prop() password: string;
}

export const Users = new User().getModelForClass(User, {
	existingMongoose: MongooseInstance,
	schemaOptions: {
		collection: 'users'
	}
});