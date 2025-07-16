import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';
import MarketInsight from '../models/MarketInsight.js';
import User from '../models/User.js';

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const courses = await Course.find(query)
      .select('-lessons.content -lessons.quiz')
      .sort({ createdAt: -1 });

    // Add user progress if authenticated
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      const progress = await UserProgress.findOne({
        userId: req.user?.id,
        courseId: course.id
      });

      return {
        ...course.toObject(),
        userProgress: progress ? {
          progressPercentage: progress.progressPercentage,
          completedLessons: progress.completedLessons.length,
          totalLessons: course.lessons.length,
          lastAccessedAt: progress.lastAccessedAt
        } : null
      };
    }));

    res.json(coursesWithProgress);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get course details
export const getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ id: courseId, isPublished: true });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get user progress
    const progress = await UserProgress.findOne({
      userId: req.user?.id,
      courseId: courseId
    });

    // Don't send quiz answers in the response
    const courseData = {
      ...course.toObject(),
      lessons: course.lessons.map(lesson => ({
        ...lesson.toObject(),
        quiz: lesson.quiz.map(q => ({
          question: q.question,
          options: q.options,
          explanation: q.explanation
          // Don't include correctAnswer
        }))
      }))
    };

    res.json({
      ...courseData,
      userProgress: progress ? {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons,
        currentLesson: progress.currentLesson,
        quizScores: progress.quizScores,
        timeSpent: progress.timeSpent,
        lastAccessedAt: progress.lastAccessedAt
      } : null
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Enroll in course
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findOne({ id: courseId, isPublished: true });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingProgress = await UserProgress.findOne({ userId, courseId });
    if (existingProgress) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create progress record
    const progress = new UserProgress({
      userId,
      courseId,
      currentLesson: course.lessons[0]?.id
    });

    await progress.save();

    // Update enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.status(201).json({
      message: 'Successfully enrolled in course',
      progress: {
        progressPercentage: 0,
        completedLessons: [],
        currentLesson: course.lessons[0]?.id,
        timeSpent: 0
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

// Complete lesson
export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Add lesson to completed if not already completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update progress percentage
    progress.progressPercentage = (progress.completedLessons.length / course.lessons.length) * 100;

    // Update time spent
    if (timeSpent) {
      progress.timeSpent += timeSpent;
    }

    // Find next lesson
    const currentLessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (currentLessonIndex < course.lessons.length - 1) {
      progress.currentLesson = course.lessons[currentLessonIndex + 1].id;
    }

    // Check if course is completed
    if (progress.progressPercentage === 100) {
      progress.completedAt = new Date();
      progress.certificateIssued = true;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({
      message: 'Lesson completed successfully',
      progress: {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons.length,
        currentLesson: progress.currentLesson,
        isCompleted: progress.progressPercentage === 100
      }
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
};

// Submit quiz
export const submitQuiz = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = lesson.quiz.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = (correctAnswers / lesson.quiz.length) * 100;

    // Update user progress
    const progress = await UserProgress.findOne({ userId, courseId });
    if (progress) {
      // Remove existing quiz score for this lesson
      progress.quizScores = progress.quizScores.filter(s => s.lessonId !== lessonId);
      
      // Add new quiz score
      progress.quizScores.push({
        lessonId,
        score,
        totalQuestions: lesson.quiz.length,
        completedAt: new Date()
      });

      await progress.save();
    }

    res.json({
      score,
      correctAnswers,
      totalQuestions: lesson.quiz.length,
      passed: score >= 70, // Pass threshold
      results
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get market insights
export const getMarketInsights = async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const insights = await MarketInsight.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json(insights);
  } catch (error) {
    console.error('Error fetching market insights:', error);
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
};

// Get market insight details
export const getMarketInsight = async (req, res) => {
  try {
    const { insightId } = req.params;
    const insight = await MarketInsight.findOne({ id: insightId, isPublished: true });

    if (!insight) {
      return res.status(404).json({ error: 'Market insight not found' });
    }

    // Increment view count
    insight.views += 1;
    await insight.save();

    res.json({
      ...insight.toObject(),
      isLiked: req.user ? insight.likes.includes(req.user.id) : false,
      likesCount: insight.likes.length
    });
  } catch (error) {
    console.error('Error fetching market insight:', error);
    res.status(500).json({ error: 'Failed to fetch market insight' });
  }
};

// Like/unlike market insight
export const toggleInsightLike = async (req, res) => {
  try {
    const { insightId } = req.params;
    const userId = req.user.id;

    const insight = await MarketInsight.findOne({ id: insightId });
    if (!insight) {
      return res.status(404).json({ error: 'Market insight not found' });
    }

    const isLiked = insight.likes.includes(userId);
    
    if (isLiked) {
      insight.likes = insight.likes.filter(id => id !== userId);
    } else {
      insight.likes.push(userId);
    }

    await insight.save();
    
    res.json({ 
      isLiked: !isLiked, 
      likesCount: insight.likes.length 
    });
  } catch (error) {
    console.error('Error toggling insight like:', error);
    res.status(500).json({ error: 'Failed to toggle insight like' });
  }
};

// Get user's learning progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await UserProgress.find({ userId })
      .populate({
        path: 'courseId',
        model: 'Course',
        select: 'title category difficulty estimatedTime'
      })
      .sort({ lastAccessedAt: -1 });

    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter(p => p.completedAt).length,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageProgress: progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length || 0
    };

    res.json({
      progress,
      stats
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
};