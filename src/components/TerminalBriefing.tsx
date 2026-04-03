import { MetarData } from '../utils/metarParser';
import { Airport } from '../types';
import TiltCard from './TiltCard';

interface TerminalBriefingProps {
  airport: Airport;
  metar: MetarData | null;
  type: 'Origin' | 'Destination';
}

const TerminalBriefing: React.FC<TerminalBriefingProps> = ({ airport, metar, type }) => {
  
  if (!metar) {
    return (
      <TiltCard>
        <div className="card-header tactical-header" style={{ padding: '1rem 1rem 0' }}>
          <div className="card-title">{type}: {airport.icao || 'Location'} Terminal Briefing</div>
        </div>
        <div style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontFamily: 'monospace', padding: '0 1rem 1rem' }}>
          {'>'} NO METAR REPORTING STATION AVAILABLE AT THIS LOCATION. <br/>
          {'>'} {airport.icao} may be a minor classification airport or weather systems are currently offline.
        </div>
      </TiltCard>
    );
  }

  // Determine flight rule color
  const fcColors = {
    'VFR': 'var(--color-success)',
    'MVFR': 'var(--color-info)',
    'IFR': 'var(--color-warning)',
    'LIFR': 'var(--color-danger)',
    'UNKNOWN': 'var(--text-muted)'
  };

  return (
    <TiltCard>
      <div style={{ padding: '1rem' }}>
        <div className="card-header tactical-header">
          <div className="card-title">
            {type.toUpperCase()}: {airport.icao} [{airport.name}]
          </div>
          <div 
            className="flight-rule-badge" 
            style={{ 
              backgroundColor: `${fcColors[metar.flightCategory]}22`,
              color: fcColors[metar.flightCategory],
              border: `1px solid ${fcColors[metar.flightCategory]}88`,
              boxShadow: `0 0 10px ${fcColors[metar.flightCategory]}44`
            }}
          >
            {metar.flightCategory}
          </div>
        </div>

      <div className="raw-metar-box" style={{ margin: '1rem 0', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.5rem', background: 'none', borderRadius: '4px' }}>
        <div className="label" style={{ fontSize: '0.7rem' }}>RAW DATA FEED // OBSERVED: {metar.observationTime}</div>
        <div className="metar-text p-2" style={{ color: 'var(--color-success)', fontFamily: 'monospace' }}>
          {metar.raw}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
        
        {/* WIND */}
        <div className="data-box" style={{ flex: '1 1 200px', background: 'none', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="label" style={{ color: 'var(--color-info)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>SURFACE WIND</div>
          <div className="value" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
            {metar.wind.direction === 0 || metar.wind.direction === 'VRB' ? 'Variable Direction' : `${metar.wind.direction}°`} at {metar.wind.speedKnots} knots
            {metar.wind.gustKnots ? ` (Gusts up to ${metar.wind.gustKnots})` : ''}
          </div>
        </div>

        {/* VISIBILITY */}
        <div className="data-box" style={{ flex: '1 1 200px', background: 'none', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="label" style={{ color: 'var(--color-info)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>VISIBILITY</div>
          <div className="value" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
            {metar.visibility?.statuteMiles !== null ? 
              `${metar.visibility.statuteMiles >= 10 ? 'Clear (10+ Miles)' : `${metar.visibility.statuteMiles} Miles`}` 
              : 'Unknown'}
          </div>
        </div>

        {/* TEMP */}
        <div className="data-box" style={{ flex: '1 1 200px', background: 'none', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="label" style={{ color: 'var(--color-info)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>TEMPERATURE</div>
          <div className="value" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
            {metar.temperatureCelsius !== null ? metar.temperatureCelsius : '--'}°C
            {metar.dewPointCelsius !== null ? ` / Dewpoint ${metar.dewPointCelsius}°C` : ''}
          </div>
        </div>

        {/* CLOUDS */}
        <div className="data-box" style={{ flex: '1 1 250px', background: 'none', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="label" style={{ color: 'var(--color-info)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>CLOUD COVERAGE</div>
          <div className="value" style={{ fontSize: '1.1rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
            {metar.clouds.length === 0 ? 'Clear Skies' : 
              metar.clouds.map((c, i) => {
                const typeMap: Record<string, string> = {
                  'SKC': 'Clear', 'CLR': 'Clear', 'FEW': 'Few Clouds', 
                  'SCT': 'Scattered Clouds', 'BKN': 'Broken Clouds', 'OVC': 'Overcast'
                };
                return (
                  <div key={i}>
                    {typeMap[c.type] || c.type} {c.altitudeFeet ? `at ${c.altitudeFeet} ft` : ''}
                  </div>
                );
              })
            }
          </div>
        </div>

      </div>
      </div>
    </TiltCard>
  );
};

export default TerminalBriefing;
