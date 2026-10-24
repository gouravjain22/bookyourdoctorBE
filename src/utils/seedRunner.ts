import { connectDB, disconnectDB } from '../config/db';
import { seedDatabase } from './seedData';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

run();
