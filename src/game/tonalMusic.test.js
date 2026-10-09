import { expect, it } from 'vitest';
import { tonalEvents, PIECE_DURATION, createMusicRound, roundMelody } from './tonalMusic';
it('generates distinct phrases and complementary random assignments without repeating the previous phrase', () => {
  const seen = new Set();
  for (let id = 0; id < 81; id++) {
    seen.add(JSON.stringify(roundMelody(id)));
    for (const draw of [0, 0.25, 0.5, 0.99]) {
      const next = createMusicRound({ phraseId: id }, () => draw);
      expect(next.phraseId).not.toBe(id);
      expect(next.phraseId).toBeGreaterThanOrEqual(0);
      expect(next.phraseId).toBeLessThan(81);
      expect(new Set(Object.values(next.modes))).toEqual(new Set(['major', 'minor']));
    }
  }
  expect(seen.size).toBe(81);
  expect(createMusicRound(null, () => 0.1).modes.A).toBe('minor');
  expect(createMusicRound(null, () => 0.9).modes.A).toBe('major');
});
it('gives the mystery a distinct two-bar melodic phrase in the same mode, without changing accompaniment or rhythm', () => {
  for (let id = 0; id < 81; id++)
    for (const mode of ['major', 'minor']) {
      const reference = tonalEvents(mode, id);
      const mystery = tonalEvents(mode, id, true);
      expect(mystery.filter((e) => e.voice !== 'melody')).toEqual(
        reference.filter((e) => e.voice !== 'melody'),
      );
      expect(mystery.map((e) => [e.time, e.duration, e.voice])).toEqual(
        reference.map((e) => [e.time, e.duration, e.voice]),
      );
      expect(mystery.filter((e, i) => e.midi !== reference[i].midi).length).toBeGreaterThanOrEqual(
        10,
      );
      expect(mystery.filter((e) => e.time >= (8 * 60) / 96)).toEqual(
        reference.filter((e) => e.time >= (8 * 60) / 96),
      );
      const allowed = mode === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
      mystery
        .filter((e) => e.voice === 'melody')
        .forEach((e) => expect(allowed).toContain(e.midi % 12));
      expect(mystery.every((e) => e.time + e.duration < PIECE_DURATION)).toBe(true);
    }
});
it('uses the same rhythm, arrangement, dynamics and length in both keys', () => {
  const a = tonalEvents('major'),
    b = tonalEvents('minor');
  expect(a.map((e) => [e.time, e.duration, e.voice, e.volume])).toEqual(
    b.map((e) => [e.time, e.duration, e.voice, e.volume]),
  );
  expect(a.every((e) => e.time + e.duration < PIECE_DURATION)).toBe(true);
  expect(b.every((e) => e.time + e.duration < PIECE_DURATION)).toBe(true);
  expect(a.some((e, i) => e.midi !== b[i].midi)).toBe(true);
});
it('keeps the melodic contour while lowering modal degrees', () => {
  const a = tonalEvents('major').filter((e) => e.voice === 'melody');
  const b = tonalEvents('minor').filter((e) => e.voice === 'melody');
  expect(a[0].midi).toBe(b[0].midi);
  expect(a.at(-1).midi).toBe(72);
  expect(b.at(-1).midi).toBe(72);
  a.forEach((e, i) => {
    expect([0, 1]).toContain(e.midi - b[i].midi);
    if (i) expect(Math.sign(e.midi - a[i - 1].midi)).toBe(Math.sign(b[i].midi - b[i - 1].midi));
  });
});

it('resolves every reference and mystery to the tonic with matching major or minor harmony', () => {
  for (let id = 0; id < 81; id++)
    for (const mode of ['major', 'minor'])
      for (const variation of [false, true]) {
        const events = tonalEvents(mode, id, variation);
        expect(events.filter((e) => e.voice === 'melody').at(-1).midi % 12).toBe(0);
        expect(events.filter((e) => e.voice === 'bass').at(-1).midi % 12).toBe(0);
        const ending = events.filter((e) => e.voice === 'accompaniment').slice(-8);
        expect(new Set(ending.map((e) => e.midi % 12))).toEqual(
          new Set(mode === 'minor' ? [0, 3, 7] : [0, 4, 7]),
        );
      }
});
