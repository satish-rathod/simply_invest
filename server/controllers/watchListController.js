import WatchList from '../models/WatchList.js';
import { getStockPrice, getStockDetails } from '../utils/marketData.js';

// Get user's watch lists
export const getWatchLists = async (req, res) => {
  try {
    const watchLists = await WatchList.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(watchLists);
  } catch (error) {
    console.error('Error fetching watch lists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new watch list
export const createWatchList = async (req, res) => {
  try {
    const { name, symbols = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Watch list name is required' });
    }

    const watchList = new WatchList({
      userId: req.user.id,
      name,
      symbols: symbols.map(s => s.toUpperCase()),
      isDefault: false
    });

    await watchList.save();
    res.status(201).json(watchList);
  } catch (error) {
    console.error('Error creating watch list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update watch list
export const updateWatchList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbols } = req.body;

    const watchList = await WatchList.findOne({ id, userId: req.user.id });
    
    if (!watchList) {
      return res.status(404).json({ message: 'Watch list not found' });
    }

    if (name) watchList.name = name;
    if (symbols) watchList.symbols = symbols.map(s => s.toUpperCase());

    await watchList.save();
    res.json(watchList);
  } catch (error) {
    console.error('Error updating watch list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete watch list
export const deleteWatchList = async (req, res) => {
  try {
    const { id } = req.params;
    
    const watchList = await WatchList.findOneAndDelete({ id, userId: req.user.id });
    
    if (!watchList) {
      return res.status(404).json({ message: 'Watch list not found' });
    }

    res.json({ message: 'Watch list deleted successfully' });
  } catch (error) {
    console.error('Error deleting watch list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add symbol to watch list
export const addSymbolToWatchList = async (req, res) => {
  try {
    const { id } = req.params;
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const watchList = await WatchList.findOne({ id, userId: req.user.id });
    
    if (!watchList) {
      return res.status(404).json({ message: 'Watch list not found' });
    }

    const upperSymbol = symbol.toUpperCase();
    
    if (!watchList.symbols.includes(upperSymbol)) {
      watchList.symbols.push(upperSymbol);
      await watchList.save();
    }

    res.json(watchList);
  } catch (error) {
    console.error('Error adding symbol to watch list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove symbol from watch list
export const removeSymbolFromWatchList = async (req, res) => {
  try {
    const { id } = req.params;
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const watchList = await WatchList.findOne({ id, userId: req.user.id });
    
    if (!watchList) {
      return res.status(404).json({ message: 'Watch list not found' });
    }

    const upperSymbol = symbol.toUpperCase();
    watchList.symbols = watchList.symbols.filter(s => s !== upperSymbol);
    
    await watchList.save();
    res.json(watchList);
  } catch (error) {
    console.error('Error removing symbol from watch list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get watch list with current prices
export const getWatchListWithPrices = async (req, res) => {
  try {
    const { id } = req.params;
    
    const watchList = await WatchList.findOne({ id, userId: req.user.id });
    
    if (!watchList) {
      return res.status(404).json({ message: 'Watch list not found' });
    }

    const symbolsWithData = await Promise.all(
      watchList.symbols.map(async (symbol) => {
        try {
          const price = await getStockPrice(symbol);
          const details = await getStockDetails(symbol);
          return {
            symbol,
            price,
            ...details
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return {
            symbol,
            price: 0,
            error: 'Failed to fetch data'
          };
        }
      })
    );

    res.json({
      ...watchList.toObject(),
      symbolsWithData
    });
  } catch (error) {
    console.error('Error fetching watch list with prices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};