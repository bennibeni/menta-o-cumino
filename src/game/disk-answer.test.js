import { expect, it } from 'vitest';
import { diskGroups } from './geometry';

// Independent spatial check, using the actual disk scene's vertex coordinates.
const vertices = [
  [-0.866, -0.5, 0],
  [0.866, -0.5, 0],
  [0, 1, 0],
  [0, 0, Math.sqrt(2)],
];
function volume(type, top, yaw, tilt) {
  const byColour = [];
  diskGroups(type, top).forEach((colour, i) => {
    const [x, y, z] = vertices[i];
    const u = x * Math.cos(yaw) - y * Math.sin(yaw);
    const v = x * Math.sin(yaw) + y * Math.cos(yaw);
    // Screen x/y plus camera depth: keep the same camera for all models.
    byColour[colour] = [
      u,
      -v * Math.sin(tilt) - z * Math.cos(tilt),
      v * Math.cos(tilt) - z * Math.sin(tilt),
    ];
  });
  const [a, b, c] = byColour.slice(1).map((p) => p.map((v, i) => v - byColour[0][i]));
  return (
    a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0])
  );
}

it('the scored candidate matches disk handedness for every apex combination and allowed viewing angle', () => {
  for (const target of ['A', 'B'])
    for (let top = 0; top < 4; top++) {
      for (const yaw of [0, 0.6, 1.7, 3.2, 5.8])
        for (const tilt of [0.28, 0.55, 1.05]) {
          const disk = Math.sign(volume(target, top, yaw, tilt));
          for (const candidate of ['A', 'B']) {
            const candidateTop = (top + (candidate === 'A' ? 1 : 2)) % 4;
            const molecule = Math.sign(volume(candidate, candidateTop, yaw + 1.2, 0.55));
            expect(disk === molecule).toBe(target === candidate);
          }
        }
    }
});
