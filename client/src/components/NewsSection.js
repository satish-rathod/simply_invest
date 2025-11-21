import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink } from 'lucide-react';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/news/financial');
            setNews(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setError(`Failed to fetch news: ${error.message}`);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold mb-6 text-white">Financial News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, index) => (
                    <motion.div
                        key={index}
                        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        {article.urlToImage && (
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                            <p className="text-gray-400 mb-4">{article.description}</p>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar size={16} className="mr-2" />
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                <Clock size={16} className="ml-4 mr-2" />
                                <span>{new Date(article.publishedAt).toLocaleTimeString()}</span>
                            </div>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                            >
                                Read more
                                <ExternalLink size={16} className="ml-2" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default NewsSection;