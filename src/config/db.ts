import dns from 'dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

// Configure DNS to bypass local ISP SRV resolution issues (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  // Ignore in environments that restrict custom DNS servers
}

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
    } else {
      console.log('🔌 Connecting to external MongoDB database...');
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      dbName: 'bookyourdoctor',
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`🚀 MongoDB Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    console.error(config.mongoUri,'llll')
    console.error('\n❌ ================= MongoDB Connection Failed =================');
        console.error(config.mongoUri,'llll')
    console.error('Error Details:', error.message || error);
    console.error('\nTroubleshooting Checklist:');
    console.error('1. Check if Network Access in MongoDB Atlas allows 0.0.0.0/0 (Access from Anywhere)');
    console.error('2. Verify the username and password in MONGODB_URI');
    console.error('3. If password contains special characters (like @, #, $, %), ensure they are URL-encoded');
    console.error('=================================================================\n');
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
