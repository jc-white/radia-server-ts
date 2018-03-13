import {Component, OnModuleInit} from '@nestjs/common';
import {GameDB, GameDBCore} from './iridium-core';

@Component()
export class DBService implements OnModuleInit {
	gameDB: GameDBCore;
	static connection;

	constructor() {

	}

	async onModuleInit() {
		const conn = await GameDB.connect();

		DBService.connection = conn.connection;

		this.gameDB = GameDB;

		console.log('Iridium connected!');
	}
}