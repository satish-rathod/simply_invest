// backend/models/StockRecommendation.js
import mongoose from 'mongoose';

const stockRecommendationSchema = new mongoose.Schema({
    stockName: {
        type: String,
        required: true,
    },
    tradePrice: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    stopLoss: {
        type: Number,
        required: true,
    },
    target1: {
        type: Number,
        required: true,
    },
    target2: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,

    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const StockRecommendation = mongoose.model('StockRecommendation', stockRecommendationSchema);

export default StockRecommendation;
