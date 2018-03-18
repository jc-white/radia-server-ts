import {createConnection} from 'typeorm';
import {config} from '../../../config/config.local';

export const DatabaseProviders = [
	{
		provide:    'DbConnectionToken',
		useFactory: async () => await createConnection({
			type:     'mongodb',
			url:      config.mongo.uri,
			database: 'radia',
			entities: [
				__dirname + '/../**/*.entity{.ts,.js}'
			]
		})
	}
];