// backend/models/StockMarket.js
import mongoose from 'mongoose';

const stockMarketSchema = new mongoose.Schema({
    indicesName: {
        type: String,
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },
    priceChange: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const StockMarket = mongoose.model('StockMarket', stockMarketSchema);

export default StockMarket;
