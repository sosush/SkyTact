import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  const isApiKeyError = message.includes('API key') || message.includes('VITE_WEATHER_API_KEY');
  const isNetworkError = message.includes('Failed to fetch') || message.includes('NetworkError');

  return (
    <div className="error-card" role="alert" id="error-message">
      <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div>
        <div className="error-title">Something went wrong</div>
        <div className="error-message">{message}</div>
        {isApiKeyError && (
          <div className="error-hint">
            Create a <code style={{ padding: '1px 5px', borderRadius: '4px', background: 'none', fontSize: '0.75rem' }}>.env</code> file in the project root with: <code style={{ padding: '1px 5px', borderRadius: '4px', background: 'none', fontSize: '0.75rem' }}>VITE_WEATHER_API_KEY=your_key</code>. Get a free key from{' '}
            <a href="https://openweathermap.org/appid" target="_blank" rel="noopener noreferrer">
              OpenWeatherMap
            </a>.
          </div>
        )}
        {isNetworkError && (
          <div className="error-hint">
            Check your internet connection and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
