import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tenantUserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  tenantId: { type: String, required: true, ref: 'Tenant' },
  userId: { type: String, required: true, ref: 'User' },
  role: { 
    type: String, 
    enum: ['ADMIN', 'MODERATOR', 'USER', 'VIEWER'], 
    default: 'USER' 
  },
  permissions: [{
    resource: { type: String, required: true },
    actions: [{ type: String }] // ['read', 'write', 'delete', 'admin']
  }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  invitedBy: { type: String, ref: 'User' },
  invitedAt: { type: Date },
  joinedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'dark' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  usage: {
    loginCount: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tenantUserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure unique tenant-user combination
tenantUserSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

const TenantUser = mongoose.model('TenantUser', tenantUserSchema);
export default TenantUser;