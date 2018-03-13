import {Collection, Instance, ObjectID, Property} from 'iridium';

export interface IUserDocument {
	userID: string;
	email: string;
	password: string;
}

@Collection('users')
export class User extends Instance<IUserDocument, User> implements IUserDocument {
	@ObjectID _id: string;
	@Property(String) userID: string;
	@Property(String) email: string;
	@Property(String) password: string;
}