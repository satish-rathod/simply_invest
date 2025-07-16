import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const alertSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  symbol: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEWS_MENTION'], 
    required: true 
  },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;