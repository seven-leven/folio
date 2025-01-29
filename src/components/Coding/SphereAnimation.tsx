// src/components/coding/SphereAnimation.tsx
import { useEffect, useRef, useState } from 'react';
import styles from './SphereAnimation.module.css';

const SphereAnimation = () => {
  const outputRef = useRef<HTMLPreElement>(null);
  const [lightDir, setLightDir] = useState({ x: 0, y: 5, z: 5 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const CHARACTER_LIST = ".,-~:;=!*#$@";
    const WIDTH = 21, HEIGHT = 21;
    const X_OFFSET = 10, Y_OFFSET = 10;
    const RADIUS = 16;
    const ANGLE_INCREMENT = 0.05;

    const drawFrame = (light: { x: number, y: number, z: number }) => {
      if (!outputRef.current) return;

      // Normalize light vector
      const length = Math.sqrt(light.x ** 2 + light.y ** 2 + light.z ** 2);
      const [lx, ly, lz] = [light.x/length, light.y/length, light.z/length];
      
      const matrix = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(' '));

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const xScaled = (x - X_OFFSET) * 0.6;
          const yScaled = y - Y_OFFSET;
          const distanceSq = xScaled ** 2 + yScaled ** 2;

          if (distanceSq <= RADIUS) {
            const z = Math.sqrt(RADIUS - distanceSq);
            const intensity = xScaled * lx + yScaled * ly + z * lz;
            const j = Math.floor((intensity + 1) * 6);
            matrix[y][x] = CHARACTER_LIST[Math.max(0, Math.min(j, CHARACTER_LIST.length - 1))];
          }
        }
      }

      outputRef.current.textContent = matrix.map(row => row.join('')).join('\n');
    };

    let animationFrame: number;
    
    const animate = () => {
      let currentLight = { ...lightDir };
      
      if (autoRotate) {
        const newAngle = angle + ANGLE_INCREMENT;
        setAngle(newAngle);
        currentLight = {
          x: 5 * Math.cos(newAngle),
          y: 5 * Math.sin(newAngle),
          z: 5 * Math.sin(newAngle * 0.5)
        };
        setLightDir(currentLight);
      }

      drawFrame(currentLight);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [angle, autoRotate, lightDir]);

  return (
    <div className={styles.container}>
      <div className={styles.terminalContainer}>
        <pre ref={outputRef} className={styles.output} />
      </div>

      <div className={styles.controls}>
        <div className={styles.sliderGroup}>
          <label>Light X: {lightDir.x.toFixed(2)}</label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={lightDir.x}
            onChange={(e) => setLightDir({...lightDir, x: parseFloat(e.target.value)})}
          />
        </div>

        <div className={styles.sliderGroup}>
          <label>Light Y: {lightDir.y.toFixed(2)}</label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={lightDir.y}
            onChange={(e) => setLightDir({...lightDir, y: parseFloat(e.target.value)})}
          />
        </div>

        <div className={styles.sliderGroup}>
          <label>Light Z: {lightDir.z.toFixed(2)}</label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={lightDir.z}
            onChange={(e) => setLightDir({...lightDir, z: parseFloat(e.target.value)})}
          />
        </div>

        <button 
          className={styles.toggleButton}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? '⏸ Stop Rotation' : '▶ Start Rotation'}
        </button>
      </div>
    </div>
  );
};

export default SphereAnimation;