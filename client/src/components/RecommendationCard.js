import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const isPositive = recommendation.action.toLowerCase() === 'buy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-700 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-white">{recommendation.stockName}</h3>
        <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
          <span className="ml-1 font-semibold">{recommendation.action}</span>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <span className="text-xl font-bold text-white">₹{recommendation.tradePrice}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div className="bg-gray-700 rounded p-2">
          <span className="text-gray-400">Target 1:</span>
          <p className="font-semibold text-green-400">₹{recommendation.target1}</p>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <span className="text-gray-400">Target 2:</span>
          <p className="font-semibold text-green-400">₹{recommendation.target2}</p>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <span className="text-gray-400">Stop Loss:</span>
          <p className="font-semibold text-red-400">₹{recommendation.stopLoss}</p>
        </div>
      </div>
      <div className="bg-gray-700 rounded p-3 mt-3">
        <h4 className="font-semibold text-white mb-1">Reason:</h4>
        <p className="text-gray-300 text-sm">{recommendation.reason || "No reason provided."}</p>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;