const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserModel = require('../models/cms-users');
const config = require('../../config');

const { NotFound, Forbidden } = require('../helpers/api_error');

passport.use(
	new JWTstrategy(
		{
			secretOrKey: config.get('JWT_SECRET'),
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken('Authorization')
		},
		async (token, done) => {
			try {
				done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	'login',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password'
		},
		async (email, password, done) => {
			try {
				const user = await UserModel.findOne({ email });
				if (!user) {
					return done(new NotFound('User not found'));
				}

				const validate = await user.isValidPassword(password);
				if (!validate) {
					return done(new Forbidden('Wrong password or email'));
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		}
	)
);
