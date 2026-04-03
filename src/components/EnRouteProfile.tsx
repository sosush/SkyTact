import { WaypointWeather, AviationHazard } from '../types';
import TiltCard from './TiltCard';

interface EnRouteProfileProps {
  flightPlan: any[];
  routeWeather: WaypointWeather[];
  hazards: AviationHazard[];
}

const EnRouteProfile: React.FC<EnRouteProfileProps> = ({ flightPlan, routeWeather, hazards }) => {
  if (!flightPlan.length || !routeWeather.length) return null;

  const W = 800;
  const H = 240;
  const padX = 40;
  const padTop = 30;
  const padBottom = 60;

  const totalDistance = flightPlan[flightPlan.length - 1].distanceFromOriginKm;
  
  // Calculate X coordinate for a given distance
  const getX = (dist: number) => padX + (dist / totalDistance) * (W - padX * 2);

  // Flight path arc (parabolic representation)
  const drawFlightArc = () => {
    let d = `M ${padX} ${H - padBottom} `; // Start at origin (ground)
    // Bezier control point pulls the arc up to "cruising altitude"
    d += `Q ${W/2} ${-H*0.5} ${W - padX} ${H - padBottom}`; 
    return d;
  };

  // Find hazards for a specific waypoint
  const getHazardsForWp = (index: number) => hazards.filter(h => h.waypointIndex === index);

  return (
    <TiltCard id="route-profile">
      <div style={{ padding: '1rem' }}>
        <div className="card-header tactical-header">
          <div className="card-title">
          EN-ROUTE WEATHER PROFILE
        </div>
        <span className="text-caption">Great Circle Interpolation</span>
      </div>

      <div className="chart-container" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: '600px' }}>
          {/* Grid setup */}
          <line x1={padX} y1={H - padBottom} x2={W - padX} y2={H - padBottom} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          
          {/* Flight Path Arc */}
          <path 
            d={drawFlightArc()} 
            fill="none" 
            stroke="url(#flight-path-grad)" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeDasharray="4 8"
          />

          <defs>
            <linearGradient id="flight-path-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            
            {/* Hazard Gradients */}
            <radialGradient id="haz-severe">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
            <radialGradient id="haz-moderate">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.3)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>
          </defs>

          {/* Render Waypoints and Weather */}
          {flightPlan.map((wp, i) => {
            const x = getX(wp.distanceFromOriginKm);
            const wWp = routeWeather.find(w => w.waypointId === wp.id);
            const wpHazards = getHazardsForWp(i);
            
            // Render Hazard Zones (Vertical bands)
            if (wpHazards.length > 0) {
              const takesSevere = wpHazards.some(h => h.severity === 'severe');
              return (
                <rect 
                  key={`haz-${i}`}
                  x={x - 30} y={padTop} 
                  width="60" height={H - padTop - padBottom} 
                  fill={takesSevere ? "url(#haz-severe)" : "url(#haz-moderate)"}
                />
              );
            }
            return null;
          })}

          {/* Markers and Data */}
          {flightPlan.map((wp, i) => {
            const x = getX(wp.distanceFromOriginKm);
            const wWp = routeWeather.find(w => w.waypointId === wp.id);
            
            // Time formatting
            const timeStr = new Date(wp.estimatedTimeOfArrivalUnix * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            return (
              <g key={`data-${i}`}>
                {/* Ground marker tick */}
                <line x1={x} y1={H - padBottom} x2={x} y2={H - padBottom + 5} stroke="rgba(255,255,255,0.4)" />
                
                {/* Distance label */}
                <text x={x} y={H - padBottom + 18} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {Math.round(wp.distanceFromOriginKm)}km
                </text>

                {/* Time label */}
                <text x={x} y={H - padBottom + 32} fill="var(--color-info)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  ETA {timeStr}
                </text>

                {/* Weather Data block (if available) */}
                {wWp && (
                  <g transform={`translate(${x}, ${padTop + (i % 2 === 0 ? 0 : 35)})`}>
                    <rect x="-35" y="0" width="70" height="30" fill="transparent" stroke="rgba(255,255,255,0.2)" rx="4" />
                    <text x="0" y="12" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace">
                      {wWp.weatherType} / {Math.round(wWp.tempC)}°C
                    </text>
                    <text x="0" y="24" fill={wWp.headwindKnots > 0 ? "var(--color-danger)" : "var(--color-success)"} fontSize="8" textAnchor="middle" fontFamily="monospace">
                      {wWp.headwindKnots > 0 ? 'HDWD' : 'TLWD'}: {Math.round(Math.abs(wWp.headwindKnots))}kt
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        </svg>
      </div>

      {/* Hazard Legend/List */}
      {hazards.length > 0 && (
        <div className="hazard-list mt-4 p-3" style={{ background: 'none', borderLeft: '2px solid var(--color-danger)' }}>
          <div className="text-caption mb-2" style={{ color: 'var(--color-danger)' }}>DETECTED FLIGHT HAZARDS</div>
          {hazards.map((h, i) => (
             <div key={i} style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '4px' }}>
               <span style={{ color: h.severity === 'severe' ? '#ef4444' : '#f59e0b' }}>[{h.severity.toUpperCase()}]</span> 
               {' '} WP-{h.waypointIndex} : {h.type.toUpperCase()} - {h.description}
             </div>
          ))}
        </div>
      )}
      </div>
    </TiltCard>
  );
};

export default EnRouteProfile;
