import React from 'react';
import RecommendationCard from './RecommendationCard';

const StackedRecommendationCards = ({ recommendations }) => {
  return (
    <div className="space-y-4 overflow-y-auto h-full pr-2">
      {recommendations.length > 0 ? (
        recommendations.map((recommendation, index) => (
          <RecommendationCard key={index} recommendation={recommendation} />
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No recommendations available</p>
        </div>
      )}
    </div>
  );
};

export default StackedRecommendationCards;