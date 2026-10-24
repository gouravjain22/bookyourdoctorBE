"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cityController_1 = require("../controllers/cityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const clinicValidation_1 = require("../validations/clinicValidation");
const router = (0, express_1.Router)();
// Public routes
router.get('/', cityController_1.getAllCities);
router.get('/:citySlug', cityController_1.getCityBySlug);
// Admin protected routes
router.post('/', authMiddleware_1.authenticateAdmin, (0, validationMiddleware_1.validateRequest)(clinicValidation_1.createCitySchema), cityController_1.createCity);
router.put('/:id', authMiddleware_1.authenticateAdmin, cityController_1.updateCity);
router.delete('/:id', authMiddleware_1.authenticateAdmin, cityController_1.deleteCity);
exports.default = router;
