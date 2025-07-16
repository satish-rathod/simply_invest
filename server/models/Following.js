import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const followingSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  follower: { type: String, required: true, ref: 'User' },
  following: { type: String, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can't follow someone twice
followingSchema.index({ follower: 1, following: 1 }, { unique: true });

const Following = mongoose.model('Following', followingSchema);
export default Following;