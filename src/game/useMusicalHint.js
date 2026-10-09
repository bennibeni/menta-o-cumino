import { useCallback, useEffect, useRef, useState } from 'react';
import { tonalEvents, PIECE_DURATION } from './tonalMusic';

export function useMusicalHint(onNotesHeard) {
  const callback = useRef(onNotesHeard);
  useEffect(() => {
    callback.current = onNotesHeard;
  }, [onNotesHeard]);
  const playback = useRef(null);
  const context = useRef(null);
  const nodes = useRef([]);
  const frame = useRef(null);
  const generation = useRef(0);
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState('');

  const countStartedNotes = useCallback(() => {
    const current = playback.current;
    if (!current) return;
    const elapsed = current.audio.currentTime - current.start;
    const count = current.notes.filter((event) => event.time <= elapsed).length;
    if (count > current.counted) {
      callback.current?.(current.destination, count - current.counted);
      current.counted = count;
    }
  }, []);

  const cancel = useCallback(() => {
    countStartedNotes();
    playback.current = null;
    generation.current += 1;
    cancelAnimationFrame(frame.current);
    nodes.current.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch {
        /* Already ended. */
      }
      oscillator.disconnect();
      gain.disconnect();
    });
    nodes.current = [];
  }, [countStartedNotes]);

  const stop = useCallback(() => {
    cancel();
    setTarget(null);
    setMessage('');
  }, [cancel]);

  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      cancel();
      const previous = context.current;
      context.current = null;
      if (previous) previous.close().catch(() => {});
    };
  }, [cancel, stop]);

  async function play(mode, destination, title, phraseId) {
    stop();
    const token = generation.current;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('unavailable');
      if (!context.current) context.current = new Audio();
      const audio = context.current;
      await audio.resume();
      if (token !== generation.current) return;
      if (audio.state !== 'running') throw new Error('suspended');
      const events = tonalEvents(mode, phraseId, destination === 'challenge');
      const wave = audio.createPeriodicWave(
        new Float32Array([0, 0, 0, 0, 0]),
        new Float32Array([0, 1, 0.3, 0.12, 0.04]),
      );
      const start = audio.currentTime + 0.06;
      events.forEach((event) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const time = start + event.time;
        const duration = event.duration;
        oscillator.setPeriodicWave(wave);
        oscillator.frequency.value = event.frequency;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(event.volume, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        nodes.current.push({ oscillator, gain });
        oscillator.start(time);
        oscillator.stop(time + duration + 0.03);
      });
      setTarget(destination);
      setMessage(`Ascolto: ${title}.`);
      if (destination !== 'challenge')
        playback.current = {
          audio,
          start,
          destination,
          notes: events.filter((event) => event.voice === 'melody'),
          counted: 0,
        };
      function tick() {
        if (token !== generation.current) return;
        countStartedNotes();
        const elapsed = audio.currentTime - start;
        if (elapsed >= PIECE_DURATION) {
          cancel();
          setTarget(null);
          setMessage('Ascolto terminato. Puoi confrontare un altro modello.');
          return;
        }
        frame.current = requestAnimationFrame(tick);
      }
      tick();
    } catch {
      if (token !== generation.current) return;
      stop();
      setMessage('Audio non disponibile. Puoi continuare con il confronto visivo o riprovare.');
    }
  }

  return { target, message, play, stop };
}
