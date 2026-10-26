"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_1 = require("./env");
const dns_1 = __importDefault(require("dns"));
try {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}
let mongodInstance = null;
const connectDB = async () => {
    try {
        let uri = env_1.config.mongoUri;
        if (!uri) {
            console.log('⚡ No MONGODB_URI specified. Starting embedded MongoDB instance for seamless testing & local development...');
            mongodInstance = await mongodb_memory_server_1.MongoMemoryServer.create({
                instance: {
                    dbName: 'bookyourdoctor',
                },
            });
            uri = mongodInstance.getUri();
            console.log(`✅ Embedded MongoDB server running at: ${uri}`);
        } else {
            console.log('🔌 Connecting to external MongoDB database...');
        }
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(uri, {
            dbName: 'bookyourdoctor',
            serverSelectionTimeoutMS: 15000,
        });
        console.log(`🚀 MongoDB Connected successfully: ${mongoose_1.default.connection.host}/${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error('\n❌ ================= MongoDB Connection Failed =================');
        console.error('Error Details:', error.message || error);
        console.error('\nTroubleshooting Checklist:');
        console.error('1. Check if Network Access in MongoDB Atlas allows 0.0.0.0/0 (Access from Anywhere)');
        console.error('2. Verify the username and password in MONGODB_URI');
        console.error('3. If password contains special characters (like @, #, $, %), ensure they are URL-encoded');
        console.error('=================================================================\n');
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongodInstance) {
            await mongodInstance.stop();
        }
    }
    catch (error) {
        console.error('Error disconnecting MongoDB:', error);
    }
};
exports.disconnectDB = disconnectDB;
