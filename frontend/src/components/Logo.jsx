import React from 'react';

const Logo = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" /> {/* blue-500 */}
          <stop offset="100%" stopColor="#8B5CF6" /> {/* purple-500 */}
        </linearGradient>
      </defs>
      
      {/* Circle background */}
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
      
      {/* "HC" letters */}
      <path 
        d="M30 25V75M30 50H50M50 25V75M70 25V75M70 50H50" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;
