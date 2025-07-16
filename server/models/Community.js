import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const communitySchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['STOCKS', 'CRYPTO', 'OPTIONS', 'FOREX', 'GENERAL'], 
    default: 'STOCKS' 
  },
  symbol: { type: String }, // For stock-specific communities
  createdBy: { type: String, required: true, ref: 'User' },
  members: [{ type: String, ref: 'User' }],
  moderators: [{ type: String, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  memberCount: { type: Number, default: 0 },
  rules: [{ type: String }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

communitySchema.pre('save', function(next) {
  this.memberCount = this.members.length;
  this.updatedAt = Date.now();
  next();
});

const Community = mongoose.model('Community', communitySchema);
export default Community;