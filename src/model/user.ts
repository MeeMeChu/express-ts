import config from 'config';
import jwt from 'jsonwebtoken';
import mongoose, { Model, Types } from 'mongoose';
import { jwtSign } from '@lib/util';
import { logger } from '@lib/pino-log';
import { encryptPassword, isPasswordMatch } from '@util/encryption';

const { Schema } = mongoose;

export enum UserRoles {
  MEMBER = 'MEMBER',
  EMPLOYEE = 'EMPLOYEE',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: Array<keyof typeof UserRoles>;
  branches?: Array<string>;
}

type IGetUser = {
  id: string;
  roles: Array<keyof typeof UserRoles>;
};

// Put all user instance methods in this interface:
interface IUserMethods {
  fullName(): string;
  generateJWT(): string;
  comparePassword(password: string): Promise<boolean>;
}

interface UserModel extends Model<IUser, any, IUserMethods> {
  getUser(token: string): Promise<IGetUser | null>;
  // createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    password: { 
      type: String, 
      required: true,
      minlength: 8
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Invalid email address format',
      },
    },
    branches: [
      {
        type: String,
        ref: 'branches',
      },
    ],
    roles: {
      type: [String],
      required: true,
      enum: Object.values(UserRoles),
      default: [UserRoles.MEMBER],
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await encryptPassword(this.password);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return isPasswordMatch(password, this.password);
};

UserSchema.statics.getUser = async function (token) {
  const authHeader = token;
  if (!`${authHeader}`?.startsWith('Bearer')) {
    return null;
  }
  const authToken = `${authHeader}`?.split(' ')[1];
  return new Promise<IGetUser | null>((resolve, reject) => {
    jwt.verify(authToken, config.get('jwt.secret'), async (err, decoded: any) => {
      try {
        if (err) {
          // logger.error('JWT Verification Error:', err);
          throw err;
        }
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          logger.error('Token expired');
          resolve(null);
        }
        const foundUser: IUser = await UserModel.findOne({ _id: decoded?._id });
        if (!foundUser) {
          logger.error('User not found for ID:', decoded?._id);
          throw new Error('User not found');
        }
        resolve({
          id: `${foundUser?._id?.toString()}`,
          roles: foundUser?.roles,
        });
      } catch (e) {
        // logger.error('Error in getUser:', e);
        resolve(null);
      }
    });
  });
};

UserSchema.methods.generateJWT = function () {
  const expiresIn = config.get('jwt.expired');
  return jwtSign(
    {
      _id: `${this._id}`,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      roles: this.roles,
    },
    `${expiresIn}`
  );
};

export const UserModel = mongoose.model<IUser, UserModel>('users', UserSchema);
export type { IUser, IGetUser };
