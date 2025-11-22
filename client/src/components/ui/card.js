import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg shadow-lg transition-all duration-300';

  const variants = {
    default: 'bg-gray-800 border border-gray-700',
    gradient: 'bg-gray-800 border border-transparent bg-gradient-to-br from-gray-800 to-gray-900',
    'gradient-border': 'gradient-border',
    glassmorphic: 'glassmorphic'
  };

  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-xl hover:border-gray-600 cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;