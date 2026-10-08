
import { useRef, useState } from 'react';
import styles from './ChiralityGame.module.css';
import { diskGroups } from './geometry';
const COLORS = ['#f47c6b', '#6aacf2', '#69cfab', '#f4ca67'];
const LETTERS = ['A', 'B', 'C', 'D'];
// Two mirror arrangements: exchange A and B while keeping the upper D fixed.

const POINTS = [
  [-0.866, -0.5, 0],
  [0.866, -0.5, 0],
  [0, 1, 0],
  [0, 0, Math.sqrt(2)],
];

export default function DiskScene({
  type,
  disk = false,
  revealed = false,
  angle = 0,
  top = 3,
  label,
}) {
  const groups = diskGroups(type, top);
  const [yaw, setYaw] = useState(angle);
  const [tilt, setTilt] = useState(0.55);
  const drag = useRef(null);
  const lift = disk && revealed ? 0.85 : 0;
  function project([x, y, z]) {
    const u = x * Math.cos(yaw) - y * Math.sin(yaw);
    const v = x * Math.sin(yaw) + y * Math.cos(yaw);
    return [180 + u * 89, 220 - v * 89 * Math.sin(tilt) - z * 89 * Math.cos(tilt)];
  }
  const center = project([0, 0, Math.sqrt(2) / 4 + lift]);
  function group(index) {
    const color = groups[index];
    const [x, y] = project(POINTS[index].map((v, i) => (i === 2 ? v + lift : v)));
    return (
      <g key={index}>
        <circle cx={x} cy={y} r="19" fill={COLORS[color]} stroke="#314950" strokeWidth="2" />
        <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#173841">
          {LETTERS[color]}
        </text>
      </g>
    );
  }
  const ring = Array.from({ length: 64 }, (_, i) =>
    project([1.65 * Math.cos((i * Math.PI) / 32), 1.65 * Math.sin((i * Math.PI) / 32), 0]),
  );
  const outline = ring.map((p) => p.join(',')).join(' ');
  return (
    <div className={styles.viewer}>
      <div
        className={styles.dragSurface}
        role="group"
        aria-label={label}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = [e.clientX, e.clientY];
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setYaw((v) => v + (e.clientX - drag.current[0]) * 0.012);
          setTilt((v) => Math.max(0.28, Math.min(1.05, v + (e.clientY - drag.current[1]) * 0.008)));
          drag.current = [e.clientX, e.clientY];
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <svg
          viewBox="0 0 360 340"
          role="img"
          aria-label={`${label}. Quattro gruppi: ruota per confrontare la disposizione.`}
        >
          {disk && (
            <>
              <polygon
                points={ring.map(([x, y]) => [x, y + 22].join(',')).join(' ')}
                fill="#929da5"
                stroke="#596873"
                strokeWidth="2"
              />
              <path
                d={`M ${ring[0].join(' ')} ${ring.map(([x, y]) => `L ${x} ${y + 22}`).join(' ')} Z`}
                fill="#929da5"
              />
              <polygon points={outline} fill="#dce1e5" stroke="#788892" strokeWidth="2" />
              {POINTS.slice(0, 3).map((p, i) => {
                const [x, y] = project(p);
                const c = groups[i];
                return (
                  <g key={i}>
                    <ellipse
                      cx={x}
                      cy={y}
                      rx="27"
                      ry={24 * Math.sin(tilt)}
                      fill="#56636c"
                      stroke={COLORS[c]}
                      strokeWidth="7"
                    />
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fill="white"
                      fontWeight="bold"
                    >
                      {LETTERS[c]}
                    </text>
                  </g>
                );
              })}
            </>
          )}
          {POINTS.map((p, i) => {
            const [x, y] = project(p.map((v, k) => (k === 2 ? v + lift : v)));
            return (
              <line
                key={i}
                x1={center[0]}
                y1={center[1]}
                x2={x}
                y2={y}
                stroke="#6d7f89"
                strokeWidth="7"
              />
            );
          })}
          <circle cx={center[0]} cy={center[1]} r="17" fill="#34454e" />
          <text x={center[0]} y={center[1] + 5} textAnchor="middle" fill="white" fontSize="13">
            C*
          </text>
          {(!disk || revealed) && [0, 1, 2].map(group)}
          {group(3)}
        </svg>
      </div>
      <div className={styles.rotationControls}>
        <button
          type="button"
          aria-label={`${label}: ruota a sinistra`}
          onClick={() => setYaw((v) => v - 0.3)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={`${label}: ruota a destra`}
          onClick={() => setYaw((v) => v + 0.3)}
        >
          →
        </button>
        <button
          type="button"
          aria-label={`${label}: inclina`}
          onClick={() => setTilt((v) => (v > 0.8 ? 0.35 : v + 0.2))}
        >
          Inclina
        </button>
        <button
          type="button"
          onClick={() => {
            setYaw(angle);
            setTilt(0.55);
          }}
        >
          Ripristina
        </button>
      </div>
    </div>
  );
}
