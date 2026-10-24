"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_1 = require("./env");
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
        }
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(uri);
        console.log(`🚀 MongoDB Connected successfully: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
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
