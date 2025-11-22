import React from 'react';

const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const baseInputClasses = 'w-full px-4 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const iconClasses = Icon ? 'pl-10' : '';

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          className={`${baseInputClasses} ${errorClasses} ${iconClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const baseTextareaClasses = 'w-full px-4 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`${baseTextareaClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

Input.displayName = 'Input';
export default Input;