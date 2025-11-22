import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const isPositive = recommendation.action.toLowerCase() === 'buy';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
        <div>
          <h3 className="font-semibold text-white text-base">{recommendation.stockName}</h3>
          <p className="text-2xl font-bold text-white mt-1">${recommendation.tradePrice}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="flex items-center gap-1.5">
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-semibold text-sm">{recommendation.action}</span>
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Target 1</p>
          <p className="text-sm font-semibold text-green-400">${recommendation.target1}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Target 2</p>
          <p className="text-sm font-semibold text-green-400">${recommendation.target2}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
          <p className="text-sm font-semibold text-red-400">${recommendation.stopLoss}</p>
        </div>
      </div>

      {/* Reason */}
      {recommendation.reason && (
        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Analysis</p>
          <p className="text-sm text-gray-300">{recommendation.reason}</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;