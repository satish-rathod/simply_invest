import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Award, Clock, Star, TrendingUp, Users, CheckCircle, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Education = () => {
  const [courses, setCourses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      const [coursesRes, insightsRes, progressRes] = await Promise.all([
        axios.get('http://localhost:5001/api/education/courses'),
        axios.get('http://localhost:5001/api/education/insights'),
        axios.get('http://localhost:5001/api/education/progress', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: null }))
      ]);

      setCourses(coursesRes.data);
      setInsights(insightsRes.data);
      setUserProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching education data:', error);
      toast.error('Failed to load education content');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to enroll in courses');
        return;
      }

      await axios.post(`http://localhost:5001/api/education/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Successfully enrolled in course!');
      fetchEducationData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.response?.data?.error || 'Failed to enroll in course');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-400';
      case 'INTERMEDIATE': return 'text-yellow-400';
      case 'ADVANCED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'BASICS': return '📚';
      case 'TECHNICAL_ANALYSIS': return '📊';
      case 'FUNDAMENTAL_ANALYSIS': return '💹';
      case 'RISK_MANAGEMENT': return '🛡️';
      default: return '📖';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Education</h1>
          <p className="text-gray-400">Learn from expert-curated courses and market insights</p>
        </div>
        {userProgress && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{userProgress.stats.completedCourses}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{Math.round(userProgress.stats.averageProgress)}%</p>
                <p className="text-sm text-gray-400">Avg Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{Math.round(userProgress.stats.totalTimeSpent / 60)}h</p>
                <p className="text-sm text-gray-400">Time Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-1 font-medium ${activeTab === 'courses'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Courses</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-2 px-1 font-medium ${activeTab === 'insights'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Market Insights</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`pb-2 px-1 font-medium ${activeTab === 'progress'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>My Progress</span>
          </div>
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">{getCategoryIcon(course.category)}</span>
                <span className={`text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.estimatedTime}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollmentCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {course.userProgress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-blue-400">{course.userProgress.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.userProgress.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{course.userProgress.completedLessons}/{course.userProgress.totalLessons} lessons</span>
                    <span>Continue Learning</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnrollCourse(course.id);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Enroll Now</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Market Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-2 h-16 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-blue-400">{insight.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{insight.readTime} min read</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{insight.views} views</span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{insight.title}</h3>
                  <p className="text-gray-400 mb-4">{insight.summary}</p>

                  {insight.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {insight.symbols.map((symbol, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-blue-400 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          ${symbol}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>By {insight.author}</span>
                      <span>•</span>
                      <span>{new Date(insight.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && userProgress && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Courses</h3>
                  <p className="text-sm text-gray-400">Learning Progress</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Enrolled</span>
                  <span className="text-white font-medium">{userProgress.stats.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-green-400 font-medium">{userProgress.stats.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Progress</span>
                  <span className="text-blue-400 font-medium">{Math.round(userProgress.stats.averageProgress)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Time Spent</h3>
                  <p className="text-sm text-gray-400">Learning Hours</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Hours</span>
                  <span className="text-white font-medium">{Math.round(userProgress.stats.totalTimeSpent / 60)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-green-400 font-medium">2.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Daily Average</span>
                  <span className="text-blue-400 font-medium">22min</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Achievements</h3>
                  <p className="text-sm text-gray-400">Certificates & Badges</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Certificates</span>
                  <span className="text-white font-medium">{userProgress.stats.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Badges</span>
                  <span className="text-yellow-400 font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Streak</span>
                  <span className="text-green-400 font-medium">7 days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Courses</h3>
            <div className="space-y-4">
              {userProgress.progress.map((progress) => (
                <div key={progress.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{progress.courseId.title}</h4>
                    <span className="text-sm text-gray-400">{progress.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{progress.courseId.category}</span>
                    <span>Last accessed: {new Date(progress.lastAccessedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;