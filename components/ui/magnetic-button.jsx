'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Silky, low-latency, luxury spring physics
const SPRING_CONFIG = { damping: 18, stiffness: 180, mass: 0.25 };

function MagneticButton({ 
  children, 
  distance = 0.38, 
  radius = 110,
  className = '' 
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const dist = Math.hypot(distanceX, distanceY);

      // Check if mouse is hovering or within magnetic influence radius around the button
      if (dist < radius || isHovered) {
        x.set(distanceX * distance);
        y.set(distanceY * distance);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeaveWindow = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [distance, radius, isHovered, x, y]);

  return (
    <div 
      ref={containerRef} 
      className={`inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        style={{
          x: springX,
          y: springY
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export { MagneticButton };
