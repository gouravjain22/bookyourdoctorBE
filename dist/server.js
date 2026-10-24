"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const seedData_1 = require("./utils/seedData");
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        // Ensure database has default cities, specialties, clinics, doctors, and admin
        await (0, seedData_1.seedDatabaseIfEmpty)();
        const server = app_1.default.listen(env_1.config.port, () => {
            console.log(`\n========================================================`);
            console.log(`🩺 BookYourDoctor Backend Service running!`);
            console.log(`📡 URL: http://localhost:${env_1.config.port}`);
            console.log(`🌐 Environment: ${env_1.config.nodeEnv}`);
            console.log(`💬 WhatsApp Mode: ${env_1.config.whatsAppEnabled ? 'Meta Cloud API' : 'Simulated (In-App Dev Mode)'}`);
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
    }
    catch (error) {
        console.error('Fatal error starting server:', error);
        process.exit(1);
    }
};
startServer();
