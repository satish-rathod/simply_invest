import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getPortfolio,
  createPortfolio,
  addStock,
  removeStock,
  getPortfolioPerformance,
  getTransactions
} from '../controllers/portfolioController.js';

const router = express.Router();

// All portfolio routes require authentication
router.use(authMiddleware);

// Portfolio routes
router.get('/', getPortfolio);
router.post('/', createPortfolio);
router.post('/add-stock', addStock);
router.post('/remove-stock', removeStock);
router.get('/performance', getPortfolioPerformance);
router.get('/transactions', getTransactions);

export default router;