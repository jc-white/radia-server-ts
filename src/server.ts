import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './app.module';
import cookieParser = require('cookie-parser');
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as passport from 'passport';
import {CustomIoAdapter} from './socket/io-adapter';
import {Strategy as LocalStrategy} from 'passport-local';
import {AuthService} from './modules/auth/auth.service';
import {User} from './modules/auth/user.model';
import * as expressSession from 'express-session';
import * as ConnectPg from 'connect-pg-simple';
import * as pg from 'pg';

const connectPg = ConnectPg(expressSession);

export let App;

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
});

async function bootstrap() {
	console.log('Bootstrapping...');
	const app = await NestFactory.create(ApplicationModule);
	App       = app;

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use(cors({
		origin:      'http://localhost:4200',
		credentials: true
	}));

	/*	const googleParams: IOAuth2StrategyOption = {
			clientID:     '261321098673-7jb3oi9eebbg1jfehuaus5lap97p4i2c.apps.googleusercontent.com',
			clientSecret: 'oH32h7M_Rq5_n2YKsIzy2AOK',
			callbackURL:  'http://localhost:3000/auth/google/callback'
		};*/

	console.log('Config connect-pg');
	const pgPool = new pg.Pool({
		host:     'localhost',
		user:     'radia',
		password: 'radia',
		database: 'radia'
	});

	const store = new connectPg({
		pool: pgPool
	});

	console.log('Config expressSession');
	let sessionHandler = expressSession({
		secret:            'blarg',
		cookie:            {maxAge: 86400000 * 30}, //30 day session
		store:             store,
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
		cb(null, await User.query().where('userID', id));
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

	CustomIoAdapter.sessionHandler = sessionHandler;

	app.useWebSocketAdapter(new CustomIoAdapter());

	app.listen(3000, () => console.log('App listening'));
}

bootstrap();

