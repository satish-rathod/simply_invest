import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const leaderBoardSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: { type: String, required: true, ref: 'User' },
  period: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], required: true },
  metrics: {
    totalReturn: { type: Number, default: 0 },
    returnPercentage: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // Prediction accuracy
    posts: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    score: { type: Number, default: 0 } // Composite score
  },
  rank: { type: Number, default: 0 },
  badge: { type: String }, // Achievement badge
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

leaderBoardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LeaderBoard = mongoose.model('LeaderBoard', leaderBoardSchema);
export default LeaderBoard;