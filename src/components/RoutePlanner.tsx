import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AeroRouteSpecs, Airport } from '../types';
import airportsDataRaw from '../data/airports.json';

// Convert the dictionary to an array for easy searching
const AIRPORTS: Airport[] = Object.values(airportsDataRaw as Record<string, any>).map(port => ({
  icao: port.icao,
  iata: port.iata,
  name: port.name,
  city: port.city,
  country: port.country,
  lat: port.lat,
  lon: port.lon,
}));

const defaultOrigin = null;
const defaultDest = null;

interface AutocompleteProps {
  label: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  disabled: boolean;
  placeholder?: string;
}

const AirportAutocomplete: React.FC<AutocompleteProps> = ({ label, value, onChange, disabled, placeholder }) => {
  const [query, setQuery] = useState(value ? `${value.icao} - ${value.city}` : '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query if external value changes (e.g. initial load)
  useEffect(() => {
    if (value && !isOpen) {
      setQuery(`${value.icao} - ${value.city}`);
    }
  }, [value, isOpen]);

  const filteredAirports = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return AIRPORTS.filter(a => 
      a.icao.toLowerCase().includes(lowerQuery) || 
      a.city.toLowerCase().includes(lowerQuery) || 
      (a.iata && a.iata.toLowerCase().includes(lowerQuery)) ||
      a.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 50); // Limit to 50 for performance
  }, [query]);

  return (
    <div className="form-group box-origin" ref={wrapperRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        type="text"
        className="tactical-input"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onChange(null); // Clear selected value when typing
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder={placeholder || "Search City, ICAO, IATA..."}
        autoComplete="off"
      />
      
      {isOpen && query.length > 1 && (
        <ul className="autocomplete-dropdown">
          {filteredAirports.length > 0 ? (
            filteredAirports.map((airport) => (
              <li 
                key={airport.icao} 
                onClick={() => {
                  onChange(airport);
                  setQuery(`${airport.icao} - ${airport.city}`);
                  setIsOpen(false);
                }}
              >
                <div className="ap-code">{airport.icao} {airport.iata ? `(${airport.iata})` : ''}</div>
                <div className="ap-desc">{airport.city}, {airport.country} - {airport.name}</div>
              </li>
            ))
          ) : (
            <li className="no-results">NO PROTOCOLS FOUND</li>
          )}
        </ul>
      )}
    </div>
  );
};

interface RoutePlannerProps {
  onRouteSubmit: (specs: AeroRouteSpecs) => void;
  isLoading: boolean;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteSubmit, isLoading }) => {
  const [origin, setOrigin] = useState<Airport | null>(defaultOrigin);
  const [dest, setDest] = useState<Airport | null>(defaultDest);
  const [speed, setSpeed] = useState(450); // Default commercial jet speed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !dest) {
      alert("Please select both origin and destination from the dropdown.");
      return;
    }

    if (origin.icao === dest.icao) {
      alert("Origin and destination cannot be the same.");
      return;
    }

    onRouteSubmit({
      origin,
      destination: dest,
      cruiseSpeedKnots: speed,
      departureTimeUnix: Math.floor(Date.now() / 1000)
    });
  };

  return (
    <div className="glass-card tactical-panel animate-slide-up neo-glow" id="route-planner">
      <div className="card-header tactical-header">
        <div className="card-title">
          SkyTact Flight Planner
        </div>
        <span className="text-caption" style={{ color: 'var(--color-success)' }}>SYSTEM ARMED</span>
      </div>

      <form onSubmit={handleSubmit} className="route-form">
        <div className="route-grid">
          
          <AirportAutocomplete 
            label="ORIGIN [ICAO/CITY]" 
            value={origin} 
            onChange={setOrigin} 
            disabled={isLoading} 
            placeholder="Search Origin City/Code"
          />

          <div className="route-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <AirportAutocomplete 
            label="DESTINATION [ICAO/CITY]" 
            value={dest} 
            onChange={setDest} 
            disabled={isLoading} 
            placeholder="Search Dest City/Code"
          />

          <div className="form-group box-speed">
            <label>AIRCRAFT PROFILE</label>
            <select 
              value={speed}
              onChange={e => setSpeed(parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className="tactical-input"
            >
              <option value={450}>Commercial Jet (450 kts)</option>
              <option value={280}>Turboprop (280 kts)</option>
              <option value={150}>Light Twin (150 kts)</option>
              <option value={110}>Single Engine Piston (110 kts)</option>
              <option value={90}>Helicopter (90 kts)</option>
            </select>
          </div>

          <div className="form-group box-action">
            <button type="submit" disabled={isLoading || !origin || !dest} className="tactical-btn">
              {isLoading ? 'CALCULATING ROUTE...' : 'EXECUTE ROUTE PLAN'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default RoutePlanner;
