"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors.map((err) => ({
                        field: err.path.join('.').replace(/^(body|query|params)\./, ''),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(400).json({
                success: false,
                message: 'Invalid request data',
            });
        }
    };
};
exports.validateRequest = validateRequest;
