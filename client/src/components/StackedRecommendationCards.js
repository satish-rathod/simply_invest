import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import RecommendationCard from './RecommendationCard';

const CARD_OFFSET = 50;
const SCALE_FACTOR = 0.06;

const StackedRecommendationCards = ({ recommendations }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      <div className="pt-2">
        {recommendations.map((recommendation, index) => (
          <StackCard 
            key={index} 
            recommendation={recommendation} 
            index={index} 
            total={recommendations.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
};

const StackCard = ({ recommendation, index, total, progress }) => {
  const cardRef = useRef(null);

  const y = useTransform(
    progress,
    [0, 1],
    [index * CARD_OFFSET, -CARD_OFFSET]
  );

  const scale = useTransform(
    progress,
    [0, 1],
    [1 - index * SCALE_FACTOR, 1]
  );

  const opacity = useTransform(
    progress,
    [0, 1],
    [1 - index * 0.2, 1]
  );

  const springConfig = { stiffness: 300, damping: 30, bounce: 0 };
  const ySpring = useSpring(y, springConfig);
  const scaleSpring = useSpring(scale, springConfig);
  const opacitySpring = useSpring(opacity, springConfig);

  return (
    <motion.div
      ref={cardRef}
      style={{
        y: ySpring,
        scale: scaleSpring,
        opacity: opacitySpring,
        zIndex: total - index,
      }}
      className="w-full mb-4 origin-top"
    >
      <RecommendationCard recommendation={recommendation} />
    </motion.div>
  );
};

export default StackedRecommendationCards;