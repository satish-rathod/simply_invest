import express from 'express';
import { getChartData, getMarketSummary, getStockSummary, testRoute } from '../controllers/financeController.js';

const router = express.Router();

router.get('/chart', getChartData);
router.get('/market-summary', getMarketSummary);
router.get('/stock-summary', getStockSummary);
router.get('/test', testRoute);

export default router;