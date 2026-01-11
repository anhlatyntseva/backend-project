import { Router } from 'express';
import * as controller from '../controllers/propertyController.js';
import auth from '../middleware/authMiddleware.js'; // если нужен

const router = Router();
router.param('id', (req, _res, next, id) => {
  req.params.id = String(id).trim();
  next();
});
router.get('/', controller.getAllProperties);
router.get('/:id', controller.getPropertyById);
router.post('/', auth, controller.createProperty);
router.put('/:id', auth, controller.updateProperty);
router.delete('/:id', auth, controller.deleteProperty);

export default router;