// src/components/coding/SphereAnimation.tsx
import { useEffect, useRef } from 'react';
import styles from './SphereAnimation.module.css';

const SphereAnimation = () => {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const CHARACTER_LIST = ".,-~:;=!*#$@";
    const WIDTH = 21, HEIGHT = 21;
    const X_OFFSET = 10, Y_OFFSET = 10;
    const RADIUS = 16;
    const LIGHT_RADIUS = 5.0;
    const ANGLE_INCREMENT = 0.1;

    const drawFrame = (lightDirX: number, lightDirY: number) => {
      if (!outputRef.current) return;

      const lightDirMagnitude = Math.sqrt(lightDirX ** 2 + lightDirY ** 2 + 1);
      const d1 = 11 / (lightDirMagnitude * RADIUS);
      const matrix = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(' '));

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const xScaled = (x - X_OFFSET) * 0.6;
          const yScaled = y - Y_OFFSET;
          const distanceSq = xScaled ** 2 + yScaled ** 2;

          if (distanceSq <= RADIUS) {
            const z = Math.sqrt(RADIUS - distanceSq);
            const dotProduct = xScaled * lightDirX + yScaled * lightDirY + z * 1.0;
            let j = Math.floor(dotProduct * d1);
            j = Math.max(0, Math.min(j, CHARACTER_LIST.length - 1));
            matrix[y][x] = CHARACTER_LIST[j];
          }
        }
      }

      outputRef.current.textContent = matrix.map(row => row.join('')).join('\n');
    };

    let angle = 0;
    const animate = () => {
      const lightX = LIGHT_RADIUS * Math.cos(angle);
      const lightY = LIGHT_RADIUS * Math.sin(angle);
      drawFrame(lightX, lightY);
      angle += ANGLE_INCREMENT;
    };

    const intervalId = setInterval(animate, 100);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.container}>
      <pre ref={outputRef} className={styles.output} />
    </div>
  );
};

export default SphereAnimation;