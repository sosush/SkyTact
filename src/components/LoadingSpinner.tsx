import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container" id="loading-spinner">
      <div className="loading-spinner" />
      <p className="loading-text">
        Fetching atmospheric data<span className="loading-dots" />
      </p>
    </div>
  );
};

export default LoadingSpinner;
