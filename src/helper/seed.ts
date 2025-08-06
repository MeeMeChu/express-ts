import { UserModel } from '@model/user';
import config from 'config';

export const createDefaultAdmin = async () => {
  try {
    const adminRole = 'ADMIN';
    const adminUsername = `${config.get('app.admin_user')}`;
    const adminPassword = `${config.get('app.admin_pass')}`;
    const adminEmail = `${config.get('app.admin_email')}`;

    const adminUser = await UserModel.findOne({ roles: adminRole, username: adminUsername });

    if (!adminUser) {
      const adminUser = new UserModel({
        username: adminUsername,
        password: adminPassword,
        firstName: 'admin',
        lastName: 'admin',
        email: adminEmail,
        roles: adminRole,
      });

      await adminUser.save();
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating or updating admin user', error);
  }
};