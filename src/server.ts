import {NestFactory} from '@nestjs/core';
import * as mongoose from "mongoose";
import {config} from '../config/config.local';
import {ApplicationModule} from './modules/app.module';
import cookieParser = require('cookie-parser');
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as passport from 'passport';
import {DBService} from './modules/db/db.service';
import {GameSocketGateway} from './modules/socket/socket.gateway';
import {IOAuth2StrategyOption, OAuth2Strategy} from 'passport-google-oauth';
import {Strategy as LocalStrategy} from 'passport-local';
import {AuthService} from './modules/auth/auth.service';
import {User} from './modules/auth/user.model';

const mongoClient    = require('mongodb').MongoClient;
const expressSession = require('express-session'),
      MongoStore     = require('connect-mongo')(expressSession);

export let App;
export let MongoClientInstance;
export let MongooseInstance = mongoose;


process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
});

async function bootstrap() {
	console.log('Bootstrapping...');
	const app = await NestFactory.create(ApplicationModule);
	App       = app;

	console.log('Connecting to mongoDB...');
	const mongo = await mongoClient.connect(config.mongo.uri),
	      db    = mongo.db('radia');

	await mongoose.connect(config.mongo.uri);

	console.log('Connected to mongoose');

	MongoClientInstance = mongo;
	DBService.rawDb     = db;

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use(cors({
		origin:      'http://localhost:4200',
		credentials: true
	}));

	const googleParams: IOAuth2StrategyOption = {
		clientID:     '261321098673-7jb3oi9eebbg1jfehuaus5lap97p4i2c.apps.googleusercontent.com',
		clientSecret: 'oH32h7M_Rq5_n2YKsIzy2AOK',
		callbackURL:  'http://localhost:3000/auth/google/callback'
	};

	console.log('Config MongoStore');
	const mongoStore = new MongoStore({
		db: db
	});

	console.log('Config expressSession');
	let sessionHandler = expressSession({
		secret:            'blarg',
		cookie:            {maxAge: 86400000 * 30}, //30 day session
		store:             mongoStore,
		resave:            true,
		saveUninitialized: false
	});

	/*	passport.use(new OAuth2Strategy(googleParams, async function (accessToken, refreshToken, profile, done) {
			let result = AuthService.findUserByGoogleID(profile.id);

			return done(null, result[0]);
		}));*/

	passport.serializeUser(function (user: User, cb) {
		cb(null, user.userID);
	});

	passport.deserializeUser(async function (id: any, cb) {
		cb(null, await mongoose.connection.collection('users').findOne({userID: id}));
	});

	passport.use(new LocalStrategy({
		usernameField:     'email',
		passwordField:     'password',
		passReqToCallback: true
	}, async function (req, username, password, done) {
		if (req.isAuthenticated()) {
			console.log('Already authenticated');

			return done({message: 'Already logged in.'});
		}

		let result = await AuthService.validateCredentials(username, password);

		if (!result.success) {
			console.log('Invalid email or password');

			return done({message: 'Invalid email or password.'});
		}

		console.log('Authenticated successfully', result.user);

		return done(null, result.user);
	}));

	app.use(sessionHandler);

	console.log('Passport');
	app.use(passport.initialize());

	console.log('Session');
	app.use(passport.session());

	GameSocketGateway.sessionHandler = sessionHandler;

	app.listen(3000, () => console.log('App listening'));

	/*	const mc = await mongoClient.connect('mongodb://localhost:27017,localhost:27018,localhost:27019/test?replicaSet=rs0');
		const db = mc.db('test');

		const col = db.collection('blarg');

		const cs = col.watch();

		cs.on('change', function(change) {
			console.log('Change', change);
		});

		cs.on('error', err => console.log('Oh snap!', err));

		cs.on('end', function() {
			console.log('cs end');
		});

		setTimeout(async function() {
			col.insert({
				test: 'test'
			}, function(err) {
				console.log('Err?', err);
			});
		}, 2000);*/
}

bootstrap();

