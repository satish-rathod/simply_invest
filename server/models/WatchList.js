import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const watchListSchema = new mongoose.Schema({
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
  name: { type: String, required: true },
  symbols: [{ type: String }],
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

watchListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WatchList = mongoose.model('WatchList', watchListSchema);
export default WatchList;