import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['BASICS', 'INTERMEDIATE', 'ADVANCED', 'TECHNICAL_ANALYSIS', 'FUNDAMENTAL_ANALYSIS', 'RISK_MANAGEMENT'], 
    required: true 
  },
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
  estimatedTime: { type: Number, required: true }, // in minutes
  lessons: [{
    id: { type: String, default: uuidv4 },
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: { type: String },
    duration: { type: Number }, // in minutes
    order: { type: Number, required: true },
    quiz: [{
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: Number, required: true },
      explanation: { type: String }
    }]
  }],
  prerequisites: [{ type: String }],
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [{
    userId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;