import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', style = {}, id }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maximum tilt of 5 degrees
    const tiltX = (y - centerY) / (rect.height / 10);
    const tiltY = (centerX - x) / (rect.width / 10);

    setTilt({ x: tiltX, y: tiltY });
    setGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlow(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div 
      ref={cardRef}
      id={id}
      className={`tilt-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        ...style
      }}
    >
      <div className="tilt-card-content">
        <div 
          className="tilt-glow" 
          style={{ 
            '--mouse-x': `${glow.x}%`, 
            '--mouse-y': `${glow.y}%`,
            '--glow-opacity': glow.opacity
          } as any}
        />
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
