import { expect, it } from 'vitest';
import { diskGroups, threeFaceRotation, transform, VERTICES, FACES } from './geometry';
it('shows exactly three equally visible faces for every starting roll', () => {
  for (const roll of [0, 0.7, 2, 5]) {
    const points = VERTICES.map((p) => transform(threeFaceRotation(roll), p));
    const depths = FACES.map((f) => f.reduce((sum, i) => sum + points[i][2], 0) / 3);
    expect(depths.filter((z) => z > 0)).toHaveLength(3);
    depths.filter((z) => z > 0).forEach((z) => expect(z).toBeCloseTo(1 / (3 * Math.sqrt(3))));
  }
});
it('changes the apex without changing either chirality', () => {
  function parity(p) {
    let n = 0;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (p[i] > p[j]) n++;
    return n % 2;
  }
  for (const type of ['A', 'B'])
    for (let top = 0; top < 4; top++) {
      const groups = diskGroups(type, top);
      expect(new Set(groups).size).toBe(4);
      expect(groups[3]).toBe(top);
      expect(parity(groups)).toBe(type === 'A' ? 0 : 1);
    }
});
