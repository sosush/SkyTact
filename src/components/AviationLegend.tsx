import React, { useState } from 'react';

const AviationLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const definitions = [
    { term: 'VFR', desc: 'Clear Skies: Flying by sight.' },
    { term: 'MVFR', desc: 'Cloudy: Sight is limited.' },
    { term: 'IFR', desc: 'Low Clouds: Flying by instruments only.' },
    { term: 'LIFR', desc: 'Danger: Fog/Heavy clouds. Low visibility.' },
    { term: 'KTS', desc: 'Knots: Nautical speed (1.15 mph).' },
    { term: 'METAR', desc: 'Airport Report: Standard weather data hex.' }
  ];

  return (
    <div 
      className={`glossary-trigger ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="g-button">G</div>
      
      {(isHovered || isExpanded) && (
        <div className="glossary-popup">
          <div className="glossary-header">SKYTACT MISSION DEBRIEF: GLOSSARY</div>
          <div className="glossary-list">
            {definitions.map(d => (
              <div key={d.term} className="glossary-item">
                <span className="term">{d.term}</span>
                <span className="desc">{d.desc}</span>
              </div>
            ))}
          </div>
          {isExpanded && <div className="expand-hint">Click to Collapse</div>}
          {!isExpanded && <div className="expand-hint">Click to Lock Open</div>}
        </div>
      )}
    </div>
  );
};

export default AviationLegend;
