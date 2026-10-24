"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cityRoutes_1 = __importDefault(require("./routes/cityRoutes"));
const specialtyRoutes_1 = __importDefault(require("./routes/specialtyRoutes"));
const clinicRoutes_1 = __importDefault(require("./routes/clinicRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security and utility middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: [env_1.config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (env_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'BookYourDoctor API',
    });
});
// Mount application API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/cities', cityRoutes_1.default);
app.use('/api/specialties', specialtyRoutes_1.default);
app.use('/api/clinics', clinicRoutes_1.default);
app.use('/api/doctors', doctorRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
// Fallback handlers
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
