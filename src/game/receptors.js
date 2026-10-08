// Shared colours for receptors, reference labels and revealed solutions.
export const ODOR_COLORS = { A: '#69cfab', B: '#f4ca67' };

// Hypothetical teaching model, not a prediction for real biological receptors.
export const RECEPTORS = {
  1: { name: 'Recettore Menta', preferredType: 'A', color: ODOR_COLORS.A },
  2: { name: 'Recettore Cumino', preferredType: 'B', color: ODOR_COLORS.B },
};

export const MOLECULES = {
  A: { name: '(R)-carvone', aroma: 'Menta' },
  B: { name: '(S)-carvone', aroma: 'Cumino' },
};

export function responseFor(type, receptor) {
  return type === RECEPTORS[receptor].preferredType ? 'forte' : 'debole';
}
