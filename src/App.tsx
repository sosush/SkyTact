import React, { useState } from 'react';
import RoutePlanner from './components/RoutePlanner';
import TerminalBriefing from './components/TerminalBriefing';
import EnRouteProfile from './components/EnRouteProfile';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import TiltCard from './components/TiltCard';
import BackgroundGlobe from './components/BackgroundGlobe';
import AviationLegend from './components/AviationLegend';
import { AeroRouteSpecs, TabKey } from './types';
import { calculateAeroRoute } from './services/weatherService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // SkyTact State
  const [routingData, setRoutingData] = useState<any>(null);

  const handleRouteExecution = async (specs: AeroRouteSpecs) => {
    setIsLoading(true);
    setError(null);
    setRoutingData(null);

    try {
      const data = await calculateAeroRoute(specs);
      setRoutingData(data);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Routing calculation failed. Check API keys and network.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = !!routingData;

  const tabs: { key: string; label: string; disabled: boolean }[] = [
    { key: 'overview', label: 'ROUTE OVERVIEW', disabled: !hasData },
    { key: 'terminal', label: 'METAR DETAILS', disabled: !hasData },
  ];

  // Calculate arc style based on flight speed (Jet vs Light)
  const getArcStyle = (speed: number) => {
    // Jet: Cyan, fast dash
    if (speed >= 400) return { color: '#00f2ff', dashLength: 0.9, dashGap: 0.1, dashAnimateTime: 800 };
    // Turboprop: Yellow, med dash
    if (speed >= 200) return { color: '#fbbf24', dashLength: 0.4, dashGap: 0.2, dashAnimateTime: 2000 };
    // Light Single: Green, slow dotted
    return { color: '#22c55e', dashLength: 0.1, dashGap: 0.4, dashAnimateTime: 4000 };
  };

  const globeArcs = (routingData && routingData.flightPlan.length > 0) ? [{
    startLat: routingData.flightPlan[0].lat,
    startLng: routingData.flightPlan[0].lon,
    endLat: routingData.flightPlan[routingData.flightPlan.length - 1].lat,
    endLng: routingData.flightPlan[routingData.flightPlan.length - 1].lon,
    ...getArcStyle(routingData.cruiseSpeedKnots || 450)
  }] : [];

  return (
    <div className="tactical-bg" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* FULL SCREEN BACKGROUND */}
      <BackgroundGlobe arcs={globeArcs} />

      {/* FLOATING DATA DASHBOARD */}
      <div className="floating-dashboard">
        <div className="floating-pane">
          {/* Tactical Header */}
          <header className="app-header">
            <img src="/logo.png" alt="SkyTact Logo" className="app-logo" />
            <div className="header-text">
              <h1 className="app-title">SkyTact</h1>
              <p className="app-tagline">ADVANCED AVIATION INTELLIGENCE</p>
            </div>
          </header>

          {/* Input Planner */}
          <RoutePlanner onRouteSubmit={handleRouteExecution} isLoading={isLoading} />

          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}

          {/* Routing Outputs */}
          {hasData && !isLoading && !error && (
            <div className="animate-slide-up mt-6">

              {/* Tab Navigation */}
              <nav className="tab-nav tactical-tabs mb-6" id="main-tab-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active tactical-active' : ''}`}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    disabled={tab.disabled}
                  >
                    <span className="hide-mobile" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  <EnRouteProfile
                    flightPlan={routingData.flightPlan}
                    routeWeather={routingData.routeWeather}
                    hazards={routingData.hazards}
                  />

                  {/* Summary boxes (FULL WIDTH) */}
                  <TiltCard>
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <div className="card-header tactical-header" style={{ justifyContent: 'center' }}>
                        <div className="card-title">Origin: {routingData.terminals.originEndpoint.icao}</div>
                      </div>
                      <div style={{ fontFamily: 'monospace' }}>
                        <div>Condition: <span className="neon-text">{routingData.terminals.origin?.flightCategory || 'UNKN'}</span></div>
                        <div>Temp: {routingData.terminals.origin?.temperatureCelsius ?? 'M'}°C</div>
                      </div>
                    </div>
                  </TiltCard>

                  <TiltCard>
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <div className="card-header tactical-header" style={{ justifyContent: 'center' }}>
                        <div className="card-title">Destination: {routingData.terminals.destEndpoint.icao}</div>
                      </div>
                      <div style={{ fontFamily: 'monospace' }}>
                        <div>Condition: <span className="neon-text">{routingData.terminals.destination?.flightCategory || 'UNKN'}</span></div>
                        <div>Temp: {routingData.terminals.destination?.temperatureCelsius ?? 'M'}°C</div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              )}

              {/* TERMINAL DETAILS TAB */}
              {activeTab === 'terminal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <TerminalBriefing
                    airport={routingData.terminals.originEndpoint}
                    metar={routingData.terminals.origin}
                    type="Origin"
                  />
                  <TerminalBriefing
                    airport={routingData.terminals.destEndpoint}
                    metar={routingData.terminals.destination}
                    type="Destination"
                  />
                </div>
              )}

            </div>
          )}

          {/* Glossary at the bottom */}
          {hasData && !isLoading && !error && (
            <AviationLegend />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
