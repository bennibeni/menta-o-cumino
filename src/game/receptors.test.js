import { expect, it } from 'vitest';
import { responseFor } from './receptors';

it.each([
  ['A', 1, 'forte'],
  ['A', 2, 'debole'],
  ['B', 1, 'debole'],
  ['B', 2, 'forte'],
])('tipo %s e recettore %i danno risposta %s', (type, receptor, expected) => {
  expect(responseFor(type, receptor)).toBe(expected);
});
