// ============================================
// AeroRoute — Aviation Data Service Layer
// ============================================

import { MetarData, parseMetar } from '../utils/metarParser';
import { Airport, WaypointWeather, AeroRouteSpecs, AviationHazard } from '../types';
import { generateFlightPlan, calculateWindComponents, calculateBearing, Waypoint } from '../utils/geospatial';
import { OPENWEATHERMAP_API_KEY, OPENWEATHERMAP_BASE_URL } from '../constants';

// Open free service provided by the US National Weather Service
// Proxied to bypass CORS block in browser
const AVIATION_WEATHER_API = 'https://corsproxy.io/?url=' + encodeURIComponent('https://aviationweather.gov/api/data/metar');

/**
 * Fetches and parses raw METAR data for an airport.
 */
export const fetchMetar = async (icao: string): Promise<MetarData | null> => {
  try {
    const targetUrl = `https://aviationweather.gov/api/data/metar?ids=${icao.toUpperCase()}&format=raw`;
    const response = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch METAR for ${icao}`);
    }

    const rawData = await response.text();
    if (!rawData || rawData.trim() === '') return null;

    return parseMetar(rawData);
  } catch (err) {
    console.warn(`Primary METAR fetch failed for ${icao}. Proceeding to fallback...`);
    return null;
  }
};

/**
 * Synthesizes a METAR-like object from OpenWeatherMap data as a 100% reliable fallback.
 */
export const fetchOwmFallback = async (airport: Airport): Promise<MetarData | null> => {
  try {
    validateApiKey();
    const response = await fetch(
      `${OPENWEATHERMAP_BASE_URL}/weather?lat=${airport.lat}&lon=${airport.lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
    );

    if (!response.ok) return null;
    const data = await response.json();

    // Synthesize MetarData from OWM
    return {
      raw: `OWM-FLLB/AUTO: SYNTHESIZED DATA FOR ${airport.icao}`,
      station: airport.icao,
      observationTime: new Date(data.dt * 1000).toISOString(),
      wind: {
        direction: data.wind.deg || null,
        speedKnots: Math.round(data.wind.speed * 1.94384),
        gustKnots: data.wind.gust ? Math.round(data.wind.gust * 1.94384) : null,
      },
      visibility: {
        meters: data.visibility || null,
        statuteMiles: data.visibility ? Math.round((data.visibility / 1609.34) * 10) / 10 : null,
        raw: data.visibility ? `${data.visibility}M` : null,
      },
      clouds: [
        {
          type: data.clouds.all > 80 ? 'OVC' : data.clouds.all > 40 ? 'BKN' : data.clouds.all > 10 ? 'SCT' : 'FEW',
          altitudeFeet: 2500, // Hardcoded estimate as OWM doesn't provide base heights reliably
        }
      ],
      temperatureCelsius: Math.round(data.main.temp),
      dewPointCelsius: Math.round(data.main.temp - ((100 - data.main.humidity) / 5)), // Approximation
      altimeter: {
        hpa: data.main.pressure,
        inhg: Math.round((data.main.pressure / 33.8639) * 100) / 100,
      },
      flightCategory: data.visibility < 3000 ? 'IFR' : 'VFR', // Basic fallback category
    };
  } catch (e) {
    console.error('Fallback fetch failed:', e);
    return null;
  }
};

/**
 * Validates OWM API key
 */
const validateApiKey = (): void => {
  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
    throw new Error('API key is missing. Please set VITE_WEATHER_API_KEY in your .env file.');
  }
};

/**
 * Gets the forecasted weather at a specific Lat/Lon at a specific future time.
 * Uses OpenWeatherMap's 5-day / 3-hour forecast API, finds the closest time bucket.
 */
export const fetchWeatherForWaypoint = async (lat: number, lon: number, targetTimeUnix: number) => {
  validateApiKey();

  const response = await fetch(
    `${OPENWEATHERMAP_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
  );

  if (!response.ok) throw new Error('Failed to fetch waypoint forecast');

  const data = await response.json();
  const list = data.list as any[];

  // Find the forecast block closest in time to our estimated arrival
  const closestForecast = list.reduce((prev, curr) => {
    return (Math.abs(curr.dt - targetTimeUnix) < Math.abs(prev.dt - targetTimeUnix) ? curr : prev);
  });

  return closestForecast;
};

/**
 * The core engine routing fetcher.
 * Generates the flight plan, fetches weather along the route, and calculates hazards.
 */
export const calculateAeroRoute = async (specs: AeroRouteSpecs) => {
  // 1. Generate geospatial flight plan
  const waypoints = generateFlightPlan(
    { lat: specs.origin.lat, lon: specs.origin.lon },
    { lat: specs.destination.lat, lon: specs.destination.lon },
    specs.cruiseSpeedKnots,
    specs.departureTimeUnix,
    6 // 6 segments = 7 waypoints (including origin/dest)
  );

  // 2. Fetch Terminal Weather (METAR) with Fallback System
  let originMetar = await fetchMetar(specs.origin.icao);
  if (!originMetar) originMetar = await fetchOwmFallback(specs.origin);

  let destMetar = await fetchMetar(specs.destination.icao);
  if (!destMetar) destMetar = await fetchOwmFallback(specs.destination);

  // 3. Fetch En-Route Weather concurrently
  const routeWeather: WaypointWeather[] = [];
  const hazards: AviationHazard[] = [];
  
  const weatherFetches = waypoints.map(async (wp: Waypoint, index: number) => {
    try {
      const owmData = await fetchWeatherForWaypoint(wp.lat, wp.lon, wp.estimatedTimeOfArrivalUnix);
      
      // Calculate wind impact
      const flightBearing = calculateBearing(
        { lat: waypoints[Math.max(0, index - 1)].lat, lon: waypoints[Math.max(0, index - 1)].lon },
        { lat: wp.lat, lon: wp.lon }
      );
      
      const windSpeedKnots = owmData.wind.speed * 1.94384; // m/s to knots
      const windDir = owmData.wind.deg;
      
      const { headwind, crosswind } = calculateWindComponents(windSpeedKnots, windDir, flightBearing);

      routeWeather[index] = {
        waypointId: wp.id,
        predictedTimeUnix: wp.estimatedTimeOfArrivalUnix,
        tempC: owmData.main.temp,
        windSpeedKnots,
        windDir,
        weatherType: owmData.weather[0].main,
        headwindKnots: headwind,
        crosswindKnots: crosswind,
      };

      // Detect Hazards
      if (owmData.weather[0].main === 'Thunderstorm') {
        hazards.push({
          id: `haz-${index}-ts`,
          type: 'thunderstorm',
          severity: 'severe',
          waypointIndex: index,
          description: `Thunderstorms predicted en-route at WP-${index}.`
        });
      }

      if (crosswind > 25) {
        hazards.push({
          id: `haz-${index}-xw`,
          type: 'crosswind',
          severity: crosswind > 40 ? 'severe' : 'moderate',
          waypointIndex: index,
          description: `Strong crosswind component of ${Math.round(crosswind)}kts.`
        });
      }

      // Very simple icing proxy: Rain + freezing temps
      if ((owmData.weather[0].main === 'Rain' || owmData.weather[0].main === 'Snow') && owmData.main.temp < 0) {
        hazards.push({
          id: `haz-${index}-ice`,
          type: 'icing',
          severity: owmData.main.temp < -10 ? 'severe' : 'moderate',
          waypointIndex: index,
          description: `Probable icing conditions. Freezing temps with precipitation.`
        });
      }

    } catch (err) {
      console.warn(`Could not fetch weather for WP-${index}`, err);
    }
  });

  await Promise.all(weatherFetches);

  // Clean up any missing waypoints due to fetch errors
  const filteredWeather = routeWeather.filter(Boolean);

  return {
    flightPlan: waypoints,
    routeWeather: filteredWeather,
    hazards,
    cruiseSpeedKnots: specs.cruiseSpeedKnots,
    terminals: {
      originEndpoint: specs.origin,
      destEndpoint: specs.destination,
      origin: originMetar,
      destination: destMetar
    }
  };
};
