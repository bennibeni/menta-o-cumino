import { describe, expect, it } from 'vitest';
import { VERTICES, FACES, PALETTES, randomRotation, rotate, transform, IDENTITY } from './geometry';

const determinant = (m) =>
  m[0] * (m[4] * m[8] - m[5] * m[7]) -
  m[1] * (m[3] * m[8] - m[5] * m[6]) +
  m[2] * (m[3] * m[7] - m[4] * m[6]);
function handedness(points) {
  return Math.sign(
    determinant(points.slice(1).flatMap((point) => point.map((x, i) => x - points[0][i]))),
  );
}
function colouredCenters(type, matrix) {
  const result = [];
  FACES.forEach((face, i) => {
    result[PALETTES[type][i]] = transform(
      matrix,
      [0, 1, 2].map((axis) => face.reduce((sum, vertex) => sum + VERTICES[vertex][axis], 0) / 3),
    );
  });
  return result;
}

describe('tetrahedron chirality', () => {
  it('uses a regular tetrahedron with four distinct faces', () => {
    expect(new Set(FACES.map((f) => [...f].sort().join())).size).toBe(4);
    VERTICES.forEach((p, i) =>
      VERTICES.slice(i + 1).forEach((q) => {
        expect(p.reduce((sum, x, k) => sum + (x - q[k]) ** 2, 0)).toBe(8);
      }),
    );
  });
  it('gives opposite handedness to the two face colourings', () => {
    expect(handedness(colouredCenters('A', IDENTITY))).toBe(
      -handedness(colouredCenters('B', IDENTITY)),
    );
  });
  it('preserves lengths and handedness through random orientations and repeated dragging', () => {
    let seed = 42;
    const random = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32;
    const original = handedness(colouredCenters('A', IDENTITY));
    for (let sample = 0; sample < 100; sample++) {
      let matrix = randomRotation(random);
      for (let step = 0; step < 100; step++) matrix = rotate(matrix, 0.07, -0.13);
      expect(determinant(matrix)).toBeCloseTo(1, 10);
      expect(handedness(colouredCenters('A', matrix))).toBe(original);
      expect(handedness(colouredCenters('B', matrix))).toBe(-original);
      for (const p of VERTICES)
        expect(transform(matrix, p).reduce((sum, x) => sum + x * x, 0)).toBeCloseTo(3, 10);
    }
  });
});
