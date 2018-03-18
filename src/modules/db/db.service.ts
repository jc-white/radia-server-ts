import {Component, OnModuleInit} from '@nestjs/common';
import {Db} from 'mongodb';
import {Mongoose} from 'mongoose';
import * as mongoose from 'mongoose';
import {config} from '../../../config/config.local';
import {Hero} from '../../models/hero/hero.model';
import {User} from '../auth/user.entity';

@Component()
export class DBService implements OnModuleInit {
	static rawDb: Db;
	       connection: Mongoose;

	model = {
		Hero: Hero
	};

	constructor() {

	}

	async onModuleInit() {
		this.connection         = await mongoose.connect(config.mongo.uri);

		console.log('Mongoose connected!');
	}
}