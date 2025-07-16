import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userProgressSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: { type: String, required: true, ref: 'User' },
  courseId: { type: String, required: true, ref: 'Course' },
  completedLessons: [{ type: String }], // Array of lesson IDs
  currentLesson: { type: String },
  progressPercentage: { type: Number, default: 0 },
  quizScores: [{
    lessonId: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
  }],
  timeSpent: { type: Number, default: 0 }, // in minutes
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;