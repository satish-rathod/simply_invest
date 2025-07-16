import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getWatchLists,
  createWatchList,
  updateWatchList,
  deleteWatchList,
  addSymbolToWatchList,
  removeSymbolFromWatchList,
  getWatchListWithPrices
} from '../controllers/watchListController.js';

const router = express.Router();

// All watch list routes require authentication
router.use(authMiddleware);

// Watch list routes
router.get('/', getWatchLists);
router.post('/', createWatchList);
router.put('/:id', updateWatchList);
router.delete('/:id', deleteWatchList);
router.post('/:id/add-symbol', addSymbolToWatchList);
router.post('/:id/remove-symbol', removeSymbolFromWatchList);
router.get('/:id/prices', getWatchListWithPrices);

export default router;