import { UserRoles } from '@model/user';
import config from 'config';
import * as jsonwebtoken from 'jsonwebtoken';

// สร้างประเภทสำหรับ payload

export interface JwtTokenPayload {
  _id: string;
  roles: Array<keyof typeof UserRoles>;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ฟังก์ชัน jwtSign
export const jwtSign = (payload: JwtTokenPayload, expiresIn: any) => {
  const algorithm: jsonwebtoken.Algorithm = 'HS256';
  const options = {
    algorithm: algorithm,
    expiresIn: expiresIn ? expiresIn : '30d',
  };

  return jsonwebtoken.sign(payload, config.get('jwt.secret') as jsonwebtoken.Secret, options);
};

// ฟังก์ชัน jwtVerify
export const jwtVerify = (token: string): jsonwebtoken.JwtPayload => {
  return jsonwebtoken.verify(token, config.get('jwt.secret') as jsonwebtoken.Secret) as jsonwebtoken.JwtPayload;
};

export default {
  jwtSign,
  jwtVerify,
};