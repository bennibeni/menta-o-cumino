// Four face colours; swapping two entries reverses handedness.
export const VERTICES = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
];
export const FACES = [
  [1, 2, 3],
  [0, 3, 2],
  [0, 1, 3],
  [0, 2, 1],
];
export const PALETTES = { A: [0, 1, 2, 3], B: [1, 0, 2, 3] };
export const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function transform(matrix, point) {
  return [0, 1, 2].map((row) => point.reduce((sum, x, col) => sum + matrix[row * 3 + col] * x, 0));
}

function multiply(a, b) {
  return a.map((_, i) =>
    [0, 1, 2].reduce((sum, k) => sum + a[Math.floor(i / 3) * 3 + k] * b[k * 3 + (i % 3)], 0),
  );
}

export function rotate(matrix, dx, dy) {
  const cx = Math.cos(dy),
    sx = Math.sin(dy),
    cy = Math.cos(dx),
    sy = Math.sin(dx);
  return multiply(
    [cy, 0, sy, 0, 1, 0, -sy, 0, cy],
    multiply([1, 0, 0, 0, cx, -sx, 0, sx, cx], matrix),
  );
}

// Uniform rotation sampled using a unit quaternion, with determinant +1.
export function randomRotation(random = Math.random) {
  const u = random(),
    v = random() * Math.PI * 2,
    w = random() * Math.PI * 2;
  const x = Math.sqrt(1 - u) * Math.sin(v),
    y = Math.sqrt(1 - u) * Math.cos(v);
  const z = Math.sqrt(u) * Math.sin(w),
    s = Math.sqrt(u) * Math.cos(w);
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y - z * s),
    2 * (x * z + y * s),
    2 * (x * y + z * s),
    1 - 2 * (x * x + z * z),
    2 * (y * z - x * s),
    2 * (x * z - y * s),
    2 * (y * z + x * s),
    1 - 2 * (x * x + y * y),
  ];
}

export const INITIAL_ROTATION = rotate(IDENTITY, 0.38, -0.28);

// Camera along a vertex: three faces are equally visible, with a random in-plane roll.
export function threeFaceRotation(angle = 0) {
  const a = 1 / Math.sqrt(2),
    b = 1 / Math.sqrt(6),
    c = 1 / Math.sqrt(3);
  const base = [a, -a, 0, b, b, -2 * b, c, c, c];
  const cs = Math.cos(angle),
    sn = Math.sin(angle);
  return multiply([cs, -sn, 0, sn, cs, 0, 0, 0, 1], base);
}

// An even permutation changes the upward group without mirroring the molecule.
export function diskGroups(type, top = 3) {
  const groups = type === 'A' ? [0, 1, 2, 3] : [1, 0, 2, 3];
  const index = groups.indexOf(top);
  if (index !== 3) {
    [groups[index], groups[3]] = [groups[3], groups[index]];
    const rest = [0, 1, 2].filter((i) => i !== index);
    [groups[rest[0]], groups[rest[1]]] = [groups[rest[1]], groups[rest[0]]];
  }
  return groups;
}
