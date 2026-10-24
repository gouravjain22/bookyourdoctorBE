import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { seedDatabaseIfEmpty } from './utils/seedData';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Ensure database has default cities, specialties, clinics, doctors, and admin
    await seedDatabaseIfEmpty();

    const server = app.listen(config.port, () => {
      console.log(`\n========================================================`);
      console.log(`🩺 BookYourDoctor Backend Service running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`💬 WhatsApp Mode: ${config.whatsAppEnabled ? 'Meta Cloud API' : 'Simulated (In-App Dev Mode)'}`);
      console.log(`========================================================\n`);
    });

    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
