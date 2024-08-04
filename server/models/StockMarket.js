// backend/models/StockMarket.js
import mongoose from 'mongoose';

const stockMarketSchema = new mongoose.Schema({
    indexName: {
        type: String,
        required: true,
    },
    currentValue: {
        type: Number,
        required: true,
    },
    changePercentage: {
        type: Number,
        required: true,
    },
    marketStatus: {
        type: String,
        enum: ['Open', 'Closed'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const StockMarket = mongoose.model('StockMarket', stockMarketSchema);

export default StockMarket;
