// server/routes/stockRoutes.js
import express from 'express';
import { getRecommendations, getMarketDetails } from '../controllers/stockController.js';

const router = express.Router();

// Route to get stock recommendations
router.get('/recommendations', getRecommendations);

// Route to get stock market details
router.get('/market-details', getMarketDetails);

export default router;
