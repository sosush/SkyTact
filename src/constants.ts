// ============================================
// ForeCatcher — Constants & Configuration
// ============================================

export const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
export const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const OPENWEATHERMAP_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const MAX_HISTORY_ITEMS = 5;

// Weather condition → CSS variable overrides for the reactive theme
export interface WeatherTheme {
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  particleType: 'rain' | 'snow' | 'shimmer' | 'fog' | 'dust' | 'storm' | 'none';
}

export const WEATHER_THEMES: Record<string, WeatherTheme> = {
  Clear: {
    gradientStart: '#1a1a2e',
    gradientMid: '#16213e',
    gradientEnd: '#0f3460',
    accentPrimary: '#fbbf24',
    accentSecondary: '#f59e0b',
    accentGlow: 'rgba(251, 191, 36, 0.25)',
    particleType: 'shimmer',
  },
  Clouds: {
    gradientStart: '#1a1a2e',
    gradientMid: '#2d3748',
    gradientEnd: '#1a202c',
    accentPrimary: '#94a3b8',
    accentSecondary: '#64748b',
    accentGlow: 'rgba(148, 163, 184, 0.2)',
    particleType: 'none',
  },
  Rain: {
    gradientStart: '#0c1221',
    gradientMid: '#1e3a5f',
    gradientEnd: '#0a192f',
    accentPrimary: '#60a5fa',
    accentSecondary: '#3b82f6',
    accentGlow: 'rgba(96, 165, 250, 0.25)',
    particleType: 'rain',
  },
  Drizzle: {
    gradientStart: '#0d1b2a',
    gradientMid: '#1b2838',
    gradientEnd: '#1a365d',
    accentPrimary: '#7dd3fc',
    accentSecondary: '#38bdf8',
    accentGlow: 'rgba(125, 211, 252, 0.2)',
    particleType: 'rain',
  },
  Thunderstorm: {
    gradientStart: '#0a0a1a',
    gradientMid: '#1a0a2e',
    gradientEnd: '#0d0d2b',
    accentPrimary: '#a78bfa',
    accentSecondary: '#7c3aed',
    accentGlow: 'rgba(167, 139, 250, 0.3)',
    particleType: 'storm',
  },
  Snow: {
    gradientStart: '#1a1f3a',
    gradientMid: '#2a2f4a',
    gradientEnd: '#1e2240',
    accentPrimary: '#e2e8f0',
    accentSecondary: '#cbd5e1',
    accentGlow: 'rgba(226, 232, 240, 0.2)',
    particleType: 'snow',
  },
  Mist: {
    gradientStart: '#1a1d2e',
    gradientMid: '#252836',
    gradientEnd: '#1f2233',
    accentPrimary: '#a1a1aa',
    accentSecondary: '#71717a',
    accentGlow: 'rgba(161, 161, 170, 0.15)',
    particleType: 'fog',
  },
  Fog: {
    gradientStart: '#1a1d2e',
    gradientMid: '#252836',
    gradientEnd: '#1f2233',
    accentPrimary: '#a1a1aa',
    accentSecondary: '#71717a',
    accentGlow: 'rgba(161, 161, 170, 0.15)',
    particleType: 'fog',
  },
  Haze: {
    gradientStart: '#1a1d2e',
    gradientMid: '#2a2520',
    gradientEnd: '#1f2233',
    accentPrimary: '#d4a574',
    accentSecondary: '#b8956a',
    accentGlow: 'rgba(212, 165, 116, 0.2)',
    particleType: 'fog',
  },
  Smoke: {
    gradientStart: '#1a1a1a',
    gradientMid: '#2a2a2a',
    gradientEnd: '#1f1f1f',
    accentPrimary: '#a3a3a3',
    accentSecondary: '#737373',
    accentGlow: 'rgba(163, 163, 163, 0.15)',
    particleType: 'fog',
  },
  Dust: {
    gradientStart: '#1a1508',
    gradientMid: '#2a2010',
    gradientEnd: '#1f1a0a',
    accentPrimary: '#d97706',
    accentSecondary: '#b45309',
    accentGlow: 'rgba(217, 119, 6, 0.2)',
    particleType: 'dust',
  },
  Sand: {
    gradientStart: '#1a1508',
    gradientMid: '#2a2010',
    gradientEnd: '#1f1a0a',
    accentPrimary: '#f59e0b',
    accentSecondary: '#d97706',
    accentGlow: 'rgba(245, 158, 11, 0.2)',
    particleType: 'dust',
  },
  Ash: {
    gradientStart: '#111111',
    gradientMid: '#1a1a1a',
    gradientEnd: '#0f0f0f',
    accentPrimary: '#78716c',
    accentSecondary: '#57534e',
    accentGlow: 'rgba(120, 113, 108, 0.15)',
    particleType: 'dust',
  },
  Squall: {
    gradientStart: '#0c1221',
    gradientMid: '#1e2d5f',
    gradientEnd: '#0a192f',
    accentPrimary: '#38bdf8',
    accentSecondary: '#0284c7',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    particleType: 'storm',
  },
  Tornado: {
    gradientStart: '#0a0a0a',
    gradientMid: '#1a1a1a',
    gradientEnd: '#0f0f0f',
    accentPrimary: '#ef4444',
    accentSecondary: '#dc2626',
    accentGlow: 'rgba(239, 68, 68, 0.25)',
    particleType: 'storm',
  },
  Default: {
    gradientStart: '#1e1b4b',
    gradientMid: '#312e81',
    gradientEnd: '#4338ca',
    accentPrimary: '#818cf8',
    accentSecondary: '#a78bfa',
    accentGlow: 'rgba(129, 140, 248, 0.3)',
    particleType: 'none',
  },
};

// Weather condition → emoji icon mapping
export const WEATHER_EMOJIS: Record<string, Record<string, string>> = {
  Clear: { d: '☀️', n: '🌙' },
  Clouds: { d: '⛅', n: '☁️' },
  Rain: { d: '🌧️', n: '🌧️' },
  Drizzle: { d: '🌦️', n: '🌦️' },
  Thunderstorm: { d: '⛈️', n: '⛈️' },
  Snow: { d: '❄️', n: '❄️' },
  Mist: { d: '🌫️', n: '🌫️' },
  Fog: { d: '🌫️', n: '🌫️' },
  Haze: { d: '🌤️', n: '🌤️' },
  Smoke: { d: '💨', n: '💨' },
  Dust: { d: '💨', n: '💨' },
  Sand: { d: '💨', n: '💨' },
  Ash: { d: '🌋', n: '🌋' },
  Squall: { d: '💨', n: '💨' },
  Tornado: { d: '🌪️', n: '🌪️' },
};

// AQI scale descriptions
export const AQI_LEVELS = [
  { max: 1, label: 'Good', color: 'var(--aqi-good)', advice: 'Air quality is satisfactory. Enjoy outdoor activities!' },
  { max: 2, label: 'Fair', color: 'var(--aqi-fair)', advice: 'Acceptable air quality. Sensitive groups should limit prolonged outdoor exertion.' },
  { max: 3, label: 'Moderate', color: 'var(--aqi-moderate)', advice: 'Unhealthy for sensitive groups. Consider reducing outdoor activity.' },
  { max: 4, label: 'Poor', color: 'var(--aqi-poor)', advice: 'Unhealthy. Everyone may begin to experience health effects.' },
  { max: 5, label: 'Very Poor', color: 'var(--aqi-very-poor)', advice: 'Hazardous. Avoid all outdoor physical activity.' },
];

// UV Index scale
export const UV_LEVELS = [
  { max: 2, label: 'Low', color: 'var(--uv-low)', advice: 'No protection needed. Enjoy being outside!' },
  { max: 5, label: 'Moderate', color: 'var(--uv-moderate)', advice: 'Seek shade during midday. Wear sunscreen SPF 30+.' },
  { max: 7, label: 'High', color: 'var(--uv-high)', advice: 'Reduce sun exposure. Wear sunscreen, hat, and sunglasses.' },
  { max: 10, label: 'Very High', color: 'var(--uv-very-high)', advice: 'Take extra precautions. Avoid sun during 10am-4pm.' },
  { max: Infinity, label: 'Extreme', color: 'var(--uv-extreme)', advice: 'Stay indoors during midday. Full protection required.' },
];

// Wind direction labels
export const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
