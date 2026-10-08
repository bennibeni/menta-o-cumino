import { expect, it } from 'vitest';
import { PALETTES } from './geometry';

function permutations(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, i) =>
    permutations(items.filter((_, j) => j !== i)).map((tail) => [item, ...tail]),
  );
}
const rotations = permutations([0, 1, 2, 3]).filter((p) => {
  let inversions = 0;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (p[i] > p[j]) inversions++;
  return inversions % 2 === 0;
});
it('admits four contacts for matching chirality and at most two for the mirror image', () => {
  expect(rotations).toHaveLength(12);
  for (const target of ['A', 'B'])
    for (const molecule of ['A', 'B']) {
      const best = Math.max(
        ...rotations.map(
          (p) => p.filter((face, i) => PALETTES[molecule][face] === PALETTES[target][i]).length,
        ),
      );
      expect(best).toBe(target === molecule ? 4 : 2);
    }
});
