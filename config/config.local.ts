import * as path from 'path';

export const config = {
	db: {
		host:     'localhost',
		port:     28015,
		authKey:  undefined,
		user:     undefined,
		password: undefined,
		ssl:      undefined
	},

	mongo: {
		uri: 'mongodb://localhost:27017,localhost:27018,localhost:27019/radia?replicaSet=rs0'
	},

	paths: {
		statics:   'E:\\nginx\\html',
		nameDicts: path.join(__dirname, '..', 'src', 'modules', 'game', 'common', 'dicts', 'names')
	}
};