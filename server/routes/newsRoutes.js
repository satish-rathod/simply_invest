import express from 'express';
import { getFinancialNews } from '../controllers/newsController.js';

const router = express.Router();

router.get('/financial', getFinancialNews);

export default router;