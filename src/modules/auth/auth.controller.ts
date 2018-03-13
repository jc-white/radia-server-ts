import {Controller, Get, Response, Req, Res, Next, Post, Body} from '@nestjs/common';
import {AuthService} from './auth.service';
import * as passport from 'passport';
import * as _ from 'lodash';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {

	}

	@Get('/session')
	async getSession(@Req() req, @Res() res, @Next() next) {
		if (req.isAuthenticated()) {
			res.json({
				success: true,
				session: req.session,
				user: await this.authService.getUserByID(req.session.passport.user)
			});
		} else {
			res.json({
				success: false
			});
		}
	}

	@Get('/google')
	authGoogle(@Req() req, @Res() res, @Next() next) {
		let handler = passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']});

		return handler(req, res, next);
	}

	@Get('/google/callback')
	authGoogleCallback(@Req() req, @Res() res, @Next() next) {
		let handler = passport.authenticate('google', {
			failureRedirect: 'http://localhost:4200/login'
		}, (error) => {
			res.redirect('http://localhost:4200/game');
		});

		return handler(req, res, next);
	}

	@Post('/login')
	authLocal(@Req() req, @Res() res, @Next() next) {
		let handler = passport.authenticate('local',
			(error, user) => {
				if (error) {
					res.json({ success: false, message: error.message });
				} else {
					req.logIn(user, (err) => {
						if (!_.isEmpty(err)) {
							console.log('Login failed', err);

							res.json({
								success: false,
								message: err
							});
						} else {
							console.log('Login success');

							res.json({ success: true, user: user});
						}
					})
				}
			});

		return handler(req, res, next);
	}

	@Get('/logout')
	logout(@Req() req, @Res() res, @Next() next) {
		req.logout();

		res.json({
			success: true
		});
	}

	@Post('/register')
	async submitRegistration(@Response() res, @Body('email') email, @Body('password') password) {
		const formData = {
			email:    email,
			password: password
		};

		let response = await this.authService.createUser(formData);

		res.json(response);
	}
}