import React, { useEffect, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  dashLength: number;
  dashGap: number;
  dashAnimateTime: number;
}

interface BackgroundGlobeProps {
  arcs?: ArcData[];
}

const BackgroundGlobe: React.FC<BackgroundGlobeProps> = ({ arcs = [] }) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set rotation completely independently from arcs updates
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1.2;
      globeRef.current.controls().enableZoom = false; // Disable zooming, it's just a background
      
      // Setup initial camera pos
      globeRef.current.pointOfView({ altitude: 2 });
    }
  }, []);

  // When arcs update, point the camera at the middle of the route
  useEffect(() => {
    if (globeRef.current && arcs.length > 0) {
      const arc = arcs[0];
      const midLat = (arc.startLat + arc.endLat) / 2;
      const midLng = (arc.startLng + arc.endLng) / 2;
      
      globeRef.current.pointOfView({ lat: midLat, lng: midLng, altitude: 1.5 }, 2000);
    }
  }, [arcs]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1 }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        arcsData={arcs}
        arcStartLat={(d: object) => (d as ArcData).startLat}
        arcStartLng={(d: object) => (d as ArcData).startLng}
        arcEndLat={(d: object) => (d as ArcData).endLat}
        arcEndLng={(d: object) => (d as ArcData).endLng}
        arcColor={(d: object) => (d as ArcData).color}
        arcDashLength={(d: object) => (d as ArcData).dashLength}
        arcDashGap={(d: object) => (d as ArcData).dashGap}
        arcDashAnimateTime={(d: object) => (d as ArcData).dashAnimateTime}
        arcAltitudeAutoScale={0.3}
        backgroundColor="#000000"
      />
    </div>
  );
};

export default BackgroundGlobe;
