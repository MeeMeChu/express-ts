import config from 'config';
import mongoose from 'mongoose';
import { createDefaultAdmin } from '@helper/seed';
import { logger } from '@lib/pino-log';

const { uri, mongooseOptions }: { uri: any; mongooseOptions: any } = config.get('db.mongodb');
console.log('🚀 ~ file: mongoDB.ts:6 ~ mongooseOptions:', mongooseOptions);

mongoose.set('strictQuery', true); // Set strict query mode
mongoose.Promise = global.Promise; // Use native promises

const connectToDatabase = async () => {
  try {
    if (config.get('env') === 'production') {
      await mongoose.connect(uri, mongooseOptions); // Use only `mongooseOptions`
    } else {
      await mongoose.connect(uri); // No extra options for non-production
    }

    logger.info('Connected to MongoDB');
    await createDefaultAdmin();
  } catch (err) {
    logger.error({ err }, 'Error connecting to MongoDB');
  }
};

connectToDatabase();