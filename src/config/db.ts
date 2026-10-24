import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = config.mongoUri;

    if (!uri) {
      console.log('⚡ No MONGODB_URI specified. Starting embedded MongoDB instance for seamless testing & local development...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'bookyourdoctor',
        },
      });
      uri = mongodInstance.getUri();
      console.log(`✅ Embedded MongoDB server running at: ${uri}`);
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);

    console.log(`🚀 MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};
