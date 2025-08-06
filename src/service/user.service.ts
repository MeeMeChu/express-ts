import httpStatus from 'http-status';
import { IUser, UserModel } from '@model/user';
import ApiError from '@util/api-error';

export const UserService = {
  getUsers: async () => {
    try {
      const users = await UserModel.find().populate('branches');
      return users;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id: string) => {
    try {
      const user = await UserModel.findById(id).populate('branches').select('-password');

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async (email: string) => {
    try {
      const user = await UserModel.findOne({ email }).populate('branches').select('-password');

      return user;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { firstName, lastName, email, password, roles, branches } = userData;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new ApiError(httpStatus.CONFLICT, 'Email already exists');
      }

      const user = await UserModel.create({
        firstName,
        lastName,
        email,
        password,
        roles,
        branches: branches || [],
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id: string, updateData: Partial<IUser>) => {
    try {
      const { firstName, lastName, email, roles, branches } = updateData;

      if (email) {
        const existingUser = await UserModel.findOne({ 
          email: email,
          _id: { $ne: id } // ไม่รวม user คนนี้
        });
        if (existingUser) {
          throw new Error('Email already exists');
        }
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { firstName, lastName, email, roles, branches },
        { new: true, runValidators: true }
      )
        .populate('branches')
        .select('-password');

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  updateUserStatus: async (id: string, roles: string[]) => {
    try {
      const user = await UserModel.findByIdAndUpdate(id, { roles }, { new: true, runValidators: true })
        .populate('branches', 'name address')
        .select('-password');

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  // PATCH - เพิ่ม/ลบสาขา
  updateUserBranches: async (id: string, branches: string[]) => {
    try {
      const user = await UserModel.findByIdAndUpdate(id, { branches }, { new: true, runValidators: true })
        .populate('branches', 'name address')
        .select('-password');

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      return await UserModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  },
};
