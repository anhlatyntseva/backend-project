import express from 'express';
import * as hostController from '../controllers/hostController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', hostController.getAllHosts);
router.get('/:id', hostController.getHostById);
router.post('/', authMiddleware, hostController.createHost);
router.put('/:id', authMiddleware, hostController.updateHost);
router.delete('/:id', authMiddleware, hostController.deleteHost);

export default router;