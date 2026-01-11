import express from 'express';
import * as amenityController from '../controllers/amenityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', amenityController.getAllAmenities);
router.get('/:id', amenityController.getAmenityById);
router.post('/', authMiddleware, amenityController.createAmenity);
router.put('/:id', authMiddleware, amenityController.updateAmenity);
router.delete('/:id', authMiddleware, amenityController.deleteAmenity);

export default router;