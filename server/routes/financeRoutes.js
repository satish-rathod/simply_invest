import express from 'express';
import { getChartData, testRoute } from '../controllers/financeController.js';

const router = express.Router();

router.get('/chart', getChartData);
router.get('/test', testRoute);

export default router;