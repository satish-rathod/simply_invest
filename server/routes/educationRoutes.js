import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getCourses,
  getCourse,
  enrollCourse,
  completeLesson,
  submitQuiz,
  getMarketInsights,
  getMarketInsight,
  toggleInsightLike,
  getUserProgress
} from '../controllers/educationController.js';

const router = express.Router();

// Public routes
router.get('/courses', getCourses);
router.get('/courses/:courseId', getCourse);
router.get('/insights', getMarketInsights);
router.get('/insights/:insightId', getMarketInsight);

// Protected routes
router.use(authMiddleware);

// Course enrollment and progress
router.post('/courses/:courseId/enroll', enrollCourse);
router.post('/courses/:courseId/lessons/:lessonId/complete', completeLesson);
router.post('/courses/:courseId/lessons/:lessonId/quiz', submitQuiz);
router.get('/progress', getUserProgress);

// Market insights interactions
router.post('/insights/:insightId/like', toggleInsightLike);

export default router;