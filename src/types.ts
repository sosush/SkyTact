export interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface AeroRouteSpecs {
  origin: Airport;
  destination: Airport;
  cruiseSpeedKnots: number;
  departureTimeUnix: number;
}

export interface AviationHazard {
  id: string;
  type: 'icing' | 'turbulence' | 'crosswind' | 'low-visibility' | 'thunderstorm';
  severity: 'low' | 'moderate' | 'severe';
  waypointIndex: number;
  description: string;
}

export interface WaypointWeather {
  waypointId: string;
  predictedTimeUnix: number;
  tempC: number;
  windSpeedKnots: number;
  windDir: number;
  weatherType: string;
  headwindKnots: number;
  crosswindKnots: number;
}

// Keeping basic UI types from before that we still need
export type TabKey = 'overview' | 'terminal';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph' | 'knots';
