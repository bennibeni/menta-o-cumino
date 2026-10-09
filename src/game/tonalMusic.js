// Original four-bar miniature, shared rhythm and scale-degree melody in both modes.
const BARS = [
  [
    [
      [0, 0.5],
      [1, 0.5],
      [2, 1],
      [4, 0.5],
      [3, 0.5],
      [2, 1],
    ],
    [
      [0, 1],
      [2, 0.5],
      [4, 0.5],
      [3, 0.5],
      [1, 0.5],
      [2, 1],
    ],
    [
      [4, 0.5],
      [2, 0.5],
      [0, 1],
      [1, 0.5],
      [3, 0.5],
      [2, 1],
    ],
  ],
  [
    [
      [3, 1],
      [5, 0.5],
      [4, 0.5],
      [3, 1],
      [2, 1],
    ],
    [
      [5, 0.5],
      [4, 0.5],
      [3, 1],
      [2, 0.5],
      [3, 0.5],
      [5, 1],
    ],
    [
      [3, 0.5],
      [2, 0.5],
      [3, 1],
      [5, 1],
      [4, 1],
    ],
  ],
  [
    [
      [1, 0.5],
      [2, 0.5],
      [4, 1],
      [6, 0.5],
      [4, 0.5],
      [1, 1],
    ],
    [
      [4, 1],
      [6, 0.5],
      [4, 0.5],
      [2, 0.5],
      [1, 0.5],
      [4, 1],
    ],
    [
      [1, 1],
      [4, 0.5],
      [6, 0.5],
      [4, 1],
      [1, 1],
    ],
  ],
  [
    [
      [2, 1],
      [1, 0.5],
      [2, 0.5],
      [0, 2],
    ],
    [
      [4, 0.5],
      [3, 0.5],
      [2, 0.5],
      [1, 0.5],
      [0, 2],
    ],
    [
      [2, 0.5],
      [4, 0.5],
      [2, 1],
      [0, 2],
    ],
  ],
];
// 81 distinct four-bar phrases. Never repeat the immediately preceding phrase.
export function createMusicRound(previous, random = Math.random) {
  const count = 81;
  let phraseId = Math.floor(random() * (previous ? count - 1 : count));
  if (previous && phraseId >= previous.phraseId) phraseId++;
  const aMinor = random() < 0.5;
  return { phraseId, modes: { A: aMinor ? 'minor' : 'major', B: aMinor ? 'major' : 'minor' } };
}

export function roundMelody(phraseId, variation = false) {
  const melody = BARS.map((choices, bar) =>
    choices[Math.floor(phraseId / 3 ** bar) % 3].map((note) => [...note]),
  );
  if (variation) {
    // A distinct two-bar opening phrase; preserve rhythm, harmony and final cadence.
    const openings = [
      [2, 4, 3, 2, 1, 0],
      [2, 1, 0, 2, 4, 3],
      [0, 1, 2, 4, 3, 4],
    ];
    const continuations = [
      [5, 3, 2, 5, 3],
      [3, 5, 4, 3, 2, 3],
      [5, 4, 5, 3, 2],
    ];
    const first = phraseId % 3;
    const second = Math.floor(phraseId / 3) % 3;
    melody[0] = melody[0].map(([, length], i) => [openings[first][i], length]);
    melody[1] = melody[1].map(([, length], i) => [continuations[second][i], length]);
  }
  return melody;
}
const BEAT = 60 / 96;
export const PIECE_DURATION = 16 * BEAT + 0.6;
export function tonalEvents(mode, phraseId = 0, variation = false) {
  const minor = mode === 'minor';
  const scale = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  // Resolve V to the tonic in both modes.
  const chords = minor
    ? [
        [0, 3, 7],
        [5, 8, 12],
        [7, 11, 14],
        [0, 3, 7],
      ]
    : [
        [0, 4, 7],
        [5, 9, 12],
        [7, 11, 14],
        [0, 4, 7],
      ];
  const events = [];
  const add = (midi, beat, beats, voice) =>
    events.push({
      midi,
      time: beat * BEAT,
      duration: beats * BEAT,
      frequency: 440 * 2 ** ((midi - 69) / 12),
      voice,
      volume: voice === 'melody' ? 0.12 : 0.035,
    });
  roundMelody(phraseId, variation).forEach((bar, b) => {
    let position = b * 4;
    bar.forEach(([degree, length]) => {
      add(72 + scale[degree], position, length * 0.9, 'melody');
      position += length;
    });
    // Quiet broken chords and bass anchor the key without a loud major/minor cue.
    [0, 1, 2, 1, 0, 1, 2, 1].forEach((chordIndex, i) =>
      add(48 + chords[b][chordIndex], b * 4 + i * 0.5, 0.65, 'accompaniment'),
    );
    add(36 + chords[b][0], b * 4, 3.7, 'bass');
  });
  return events.sort((a, b) => a.time - b.time);
}
