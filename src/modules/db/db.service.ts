import {Component, OnModuleInit} from '@nestjs/common';
import {Db} from 'mongodb';
import {Mongoose} from 'mongoose';
import {User, Users} from '../auth/user.model';

@Component()
export class DBService implements OnModuleInit {
	static rawDb: Db;
	       connection: Mongoose;

	constructor() {

	}

	async onModuleInit() {

	}
}