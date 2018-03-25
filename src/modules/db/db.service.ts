import {Component, OnModuleInit} from '@nestjs/common';
import * as Knex from 'knex';
import knexTinyLogger from 'knex-tiny-logger';
import {Model} from 'objection';
import * as pgEars from 'pg-ears';
import {IPostgresChangeNotification} from './postgres-change-notification.interface';
import * as _ from 'lodash';

const knex = knexTinyLogger(Knex({
	client:     'pg',
	connection: {
		host:     'localhost',
		user:     'radia',
		password: 'radia',
		database: 'radia'
	}
}));

Model.knex(knex);

@Component()
export class DBService implements OnModuleInit {
	static knex: Knex = knex;
	static PgEars: pgEars;

	constructor() {
		const options = {
			user:     'radia',
			password: 'radia',
			database: 'radia',
			host:     'localhost'
		};

		DBService.PgEars = pgEars(options);
	}

	async onModuleInit() {

	}

	static listen(channel: string, handler: (data: string) => any) {
		DBService.PgEars.listen(channel, (err, data: string) => {
			if (err) return console.error(err);

			handler(data);
		});
	}

	static mapNotification<T extends Model>(data: string, useModel: T): { new: T, old: T } {
		const separated = data.split('|');

		const pack: IPostgresChangeNotification = {
			tableName: separated[0],
			op:        separated[1],
			new:       JSON.parse(separated[2]),
			old:       !_.isEmpty(separated[3]) ? JSON.parse(separated[3]) : null
		};

		return {
			new: (useModel.constructor as any).fromJson(pack.new),
			old: (useModel.constructor as any).fromJson(pack.old)
		}
	}
}