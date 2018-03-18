import {BaseEntity, Column, Entity, ObjectID, ObjectIdColumn} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
	@ObjectIdColumn() _id: ObjectID;
	@Column() userID: string;
	@Column() email: string;
	@Column() password: string;
}