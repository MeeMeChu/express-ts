import config from 'config';
import { UserModel } from '@model/user';
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';

const jwtOptions = {
  secretOrKey: config.get<string>('jwt.secret'),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    const user = await UserModel.findById(payload.id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);