import {Component} from '@nestjs/common';
import {UserFormData} from './auth.interfaces';
import {DBService} from '../db/db.service';
import * as bcrypt from 'bcrypt';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import {IUserDocument, User} from '../../shared/models/user/user.model';

@Component()
export class AuthService {
	constructor(private db: DBService) {

	}

	static async findUserByGoogleID(googleID: string) {
		const result = await DBService.connection.collection('users').findOne({
			googleID: googleID
		});

		return await result;
	}

	static async validateCredentials(email: string, password: string): Promise<any> {
		const result = await DBService.connection.collection('users').findOne({
			email: email
		});

		if (!result) {
			return {
				success: false
			}
		}

		let validPass = await bcrypt.compare(password, result.password);

		if (!validPass) {
			return {
				success: false
			}
		}

		return {
			success: true,
			user:    {
				userID: result.userID,
				email:  result.email
			}
		}
	}

	async getUserByID(id: string, forClient = false) {
		if (_.isEmpty(id)) {
			console.error('Tried to get invalid user: ', id);

			return null;
		}

		return this.db.gameDB.Users.findOne({
			userID: id
		});
	}

	async createUser(formData: UserFormData) {
		const existing = await DBService.connection.collection('users').findOne({
			email: formData.email
		});

		if (existing) {
			return {
				success: false,
				message: 'A user already exists with that e-mail address.'
			}
		}

		const newUserID = shortid.generate(),
		      hash      = await bcrypt.hash(formData.password, 10);

		const userData: IUserDocument = {
			userID:   newUserID,
			email:    formData.email,
			password: hash
		};

		//const result = await DBService.r.table('users').insert(newUser);
		const newUser = await this.db.gameDB.Users.insert(userData);

		if (newUser._id) {
			return {
				success: true,
				user:    _.omit(userData, 'password')
			}
		} else {
			return {
				success: false,
				message: 'An internal error occurred. Please try again.'
			}
		}
	}
}