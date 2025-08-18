import React from "react";

interface ZodiacIconWrapperProps {
  Icon: React.ElementType;
  className?: string;
}

/**
 * Wrapper component for zodiac SVG icons with standardized scaling
 */
const ZodiacIconWrapper: React.FC<ZodiacIconWrapperProps> = ({ Icon, className = "" }) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <Icon 
          className="w-full h-full max-w-full max-h-full object-contain text-black dark:text-white" 
          style={{ 
            display: 'block',
            objectFit: 'contain'
          }} 
        />
      </div>
    </div>
  );
};

export default ZodiacIconWrapper; 