"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const seedData_1 = require("./seedData");
const run = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, seedData_1.seedDatabase)();
        await (0, db_1.disconnectDB)();
        console.log('Seeding completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
run();
