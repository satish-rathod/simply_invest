import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alertController.js';

const router = express.Router();

// All alert routes require authentication
router.use(authMiddleware);

// Alert routes
router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;