
import { useRef, useState } from 'react';
import {
  FACES,
  VERTICES,
  PALETTES,
  INITIAL_ROTATION,
  rotate,
  transform,
  threeFaceRotation,
} from './geometry';
import styles from './ChiralityGame.module.css';
import DiskScene from './DiskScene';
import { MOLECULES, ODOR_COLORS } from './receptors';

const COLORS = ['#f47c6b', '#6aacf2', '#69cfab', '#f4ca67'];
const LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL = 10;

function Tetrahedron({
  type,
  initialRotation = INITIAL_ROTATION,
  label,
  cavity = false,
  receptorBody = false,
  insertedType = null,
}) {
  const [yaw, setYaw] = useState(0);
  const [tilt, setTilt] = useState(0.55);
  const matrix = rotate(rotate(initialRotation, yaw, 0), 0, tilt - 0.55);
  const drag = useRef(null);
  const turn = (x, y) => {
    setYaw((previous) => previous + x);
    setTilt((previous) => Math.max(0.28, Math.min(1.05, previous + y)));
  };
  const vertices = VERTICES.map((point) => transform(matrix, point));
  const faces = FACES.map((indices, index) => {
    const points = indices.map((i) => vertices[i]);
    const center = [0, 1, 2].map((axis) => points.reduce((sum, p) => sum + p[axis], 0) / 3);
    // For a regular centred tetrahedron, a face's centroid is its outward normal.
    return { index, points, center };
  })
    .filter(({ center }) => center[2] > 0.00001)
    .sort((a, b) => a.center[2] - b.center[2]);
  const project = ([x, y]) => [180 + x * 76, 157 - y * 76];

  return (
    <div className={styles.viewer}>
      <div
        className={styles.dragSurface}
        role="group"
        aria-label={label}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!drag.current || drag.current.id !== event.pointerId) return;
          turn((event.clientX - drag.current.x) * 0.012, (event.clientY - drag.current.y) * 0.008);
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <svg
          viewBox="0 0 360 310"
          role="img"
          aria-label={`${label}. Quattro zone A, B, C e D. Trascina o usa i pulsanti per ruotare.`}
        >
          <ellipse cx="180" cy="286" rx="84" ry="9" fill="#102b35" opacity="0.09" />
          {cavity &&
            receptorBody &&
            faces.map(({ index, points, center }) => {
              const outer = points.map((p) => p.map((value) => value * 1.23));
              return (
                <g key={`body-${index}`}>
                  <polygon
                    points={outer.map((p) => project(p).join(',')).join(' ')}
                    fill="#8c979e"
                    fillOpacity={center[2] > 0 ? 0.12 : 0.22}
                    stroke="#9ba5ac"
                    strokeWidth="10"
                    strokeLinejoin="round"
                    strokeOpacity="0.45"
                  />
                  {points.map((point, edge) => (
                    <polygon
                      key={edge}
                      points={[outer[edge], outer[(edge + 1) % 3], points[(edge + 1) % 3], point]
                        .map((p) => project(p).join(','))
                        .join(' ')}
                      fill={center[2] > 0 ? '#7c8994' : '#bac2c8'}
                      fillOpacity="0.35"
                      stroke="#a4afb7"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              );
            })}
          {faces.map(({ index, points, center }) => {
            const color = PALETTES[type][index];
            const [x, y] = project(center);
            return (
              <g key={index}>
                <polygon
                  points={points.map((p) => project(p).join(',')).join(' ')}
                  fill={
                    cavity
                      ? insertedType
                        ? COLORS[PALETTES[insertedType][index]]
                        : '#dbe2e8'
                      : COLORS[color]
                  }
                  fillOpacity={cavity ? (insertedType && receptorBody ? 0.24 : 0.12) : 1}
                  stroke="#203c47"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <polygon
                  points={points.map((p) => project(p).join(',')).join(' ')}
                  fill="#102b35"
                  opacity={cavity ? 0 : 0.15 * (1 - center[2])}
                  pointerEvents="none"
                />
                {cavity && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="white"
                      stroke={COLORS[color]}
                      strokeWidth="6"
                    />
                    {insertedType && (
                      <circle cx={x} cy={y} r="16" fill={COLORS[PALETTES[insertedType][index]]} />
                    )}
                    {insertedType && (
                      <text x={x + 24} y={y - 15} fontSize="17" fontWeight="bold" fill="#173841">
                        {PALETTES[insertedType][index] === color ? '✓' : '×'}
                      </text>
                    )}
                  </>
                )}
                {(cavity || center[2] > 0.12) && (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#102b35"
                    fontSize="24"
                    fontWeight="800"
                  >
                    {LETTERS[insertedType ? PALETTES[insertedType][index] : color]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className={styles.rotationControls} aria-label={`Rotazione: ${label}`}>
        <button
          type="button"
          onClick={() => turn(-0.3, 0)}
          aria-label={`${label}: ruota a sinistra`}
        >
          ←
        </button>
        <button type="button" onClick={() => turn(0.3, 0)} aria-label={`${label}: ruota a destra`}>
          →
        </button>
        <button
          type="button"
          onClick={() => setTilt((v) => (v > 0.8 ? 0.35 : v + 0.2))}
          aria-label={`${label}: inclina`}
        >
          Inclina
        </button>
        <button
          type="button"
          onClick={() => {
            setYaw(0);
            setTilt(0.55);
          }}
          aria-label={`${label}: ripristina la vista iniziale`}
        >
          Ripristina
        </button>
      </div>
    </div>
  );
}

export default function ChiralityGame() {
  const [view, setView] = useState('mold');
  const [round, setRound] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState(null);
  const nextButton = useRef(null);
  const score = history.filter(Boolean).length;
  const finished = history.length === TOTAL;

  function newRound(restart = false) {
    if (restart) setHistory([]);
    setAnswer(null);
    const top = Math.floor(Math.random() * 4);
    setRound({
      top,
      topA: (top + 1) % 4,
      topB: (top + 2) % 4,
      type: Math.random() < 0.5 ? 'A' : 'B',
      matrix: threeFaceRotation(Math.random() * Math.PI * 2),
      diskAngle: Math.random() * Math.PI * 2,
      angleA: Math.random() * Math.PI * 2,
      angleB: Math.random() * Math.PI * 2,
      moleculeA: threeFaceRotation(Math.random() * Math.PI * 2),
      moleculeB: threeFaceRotation(Math.random() * Math.PI * 2),
      id: restart ? 0 : history.length,
    });
  }
  function guess(type) {
    if (!round || answer !== null) return;
    setAnswer(type);
    setHistory((previous) => [...previous, type === round.type]);
    requestAnimationFrame(() => nextButton.current?.focus());
  }
  function candidate(type) {
    return (
      <article className={styles.reference}>
        <span className={styles.tag}>MOLECOLA CANDIDATA</span>
        <h2>
          <span className={styles.odorLabel} style={{ backgroundColor: ODOR_COLORS[type] }}>
            {MOLECULES[type].aroma}
          </span>
        </h2>
        <p>{MOLECULES[type].name}</p>
        {view === 'receptor' ? (
          <DiskScene
            key={`disk-${round?.id ?? 'intro'}-${type}`}
            type={type}
            top={round ? (type === 'A' ? round.topA : round.topB) : type === 'A' ? 0 : 1}
            angle={round ? (type === 'A' ? round.angleA : round.angleB) : 0}
            label={`Molecola ${MOLECULES[type].aroma}`}
          />
        ) : (
          <Tetrahedron
            key={`${round?.id ?? 'intro'}-${type}`}
            type={type}
            initialRotation={
              round ? (type === 'A' ? round.moleculeA : round.moleculeB) : INITIAL_ROTATION
            }
            label={`Molecola ${MOLECULES[type].aroma}`}
          />
        )}
        <p>Ruota e confronta l’ordine delle zone.</p>
      </article>
    );
  }
  return (
    <section className={styles.game} aria-labelledby="chirality-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>IL NASO E LA CHIRALITÀ</p>
          <h1 id="chirality-title">Riconosci l'odore. Menta o Cumino?</h1>
          <p>Quattro zone di contatto. Una sola molecola compatibile attraverso rotazioni.</p>
        </div>
        <div className={styles.score}>
          <strong>
            {score}
            <span> / {history.length}</span>
          </strong>
          <span>risposte corrette</span>
        </div>
      </header>
      <div className={styles.toolbar}>
        Ruota lo stampo e le molecole. I colori e le lettere devono coincidere tutti insieme.
      </div>
      <div className={styles.board}>
        {candidate('A')}
        <article className={styles.challenge}>
          <div className={styles.challengeTop}>
            <span className={styles.tag}>
              {round
                ? `TURNO ${Math.min(history.length + (answer === null ? 1 : 0), TOTAL)} DI ${TOTAL}`
                : 'LA SFIDA DELL’INCASTRO'}
            </span>
            <span className={styles.pill}>Geometria 3D</span>
          </div>
          <div className={styles.viewSelector} role="group" aria-label="Vista del recettore">
            <button type="button" aria-pressed={view === 'mold'} onClick={() => setView('mold')}>
              Facile
            </button>
            <button
              type="button"
              aria-pressed={view === 'receptor'}
              onClick={() => setView('receptor')}
            >
              Difficile
            </button>
          </div>
          <h2>
            {finished
              ? 'Sfida completata'
              : view === 'receptor'
                ? 'Quale odore riconosci?'
                : 'Quale odore riconosci?'}
          </h2>
          {round ? (
            <>
              {view === 'receptor' ? (
                <>
                  <DiskScene
                    key={`disk-${round.id}`}
                    type={round.type}
                    disk
                    top={round.top}
                    revealed={answer !== null}
                    angle={round.diskAngle}
                    label="Recettore a disco con molecola"
                  />
                  <p className={styles.hint}>
                    I tre gruppi inferiori sono nascosti nelle tasche. Le lettere sulle tasche
                    indicano quali gruppi ospitano. Confronta l’ordine spaziale con le due molecole.
                  </p>
                </>
              ) : (
                <>
                  <Tetrahedron
                    key={`cavity-${round.id}`}
                    type={round.type}
                    initialRotation={round.matrix}
                    label="Stampo del recettore"
                    cavity
                    receptorBody={view === 'receptor'}
                  />
                  <p className={styles.hint}>
                    {view === 'receptor'
                      ? 'Il corpo grigio semitrasparente racchiude la cavità tetraedrica. Gli anelli colorati segnano le zone di contatto interne.'
                      : 'Stampo trasparente: gli anelli segnano le quattro zone delle pareti interne. La vista iniziale mostra tre facce; ruota per scoprire la quarta.'}
                  </p>
                </>
              )}
              <div className={styles.choices}>
                <button type="button" disabled={answer !== null} onClick={() => guess('A')}>
                  Menta
                </button>
                <button type="button" disabled={answer !== null} onClick={() => guess('B')}>
                  Cumino
                </button>
              </div>
              {answer !== null && (
                <>
                  <div
                    className={`${styles.feedback} ${styles.solution}`}
                    style={{ backgroundColor: ODOR_COLORS[round.type] }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <strong>
                      {answer === round.type ? 'Esatto!' : 'Non questa volta.'} L’odore è{' '}
                      {MOLECULES[round.type].aroma.toLowerCase()}.
                    </strong>
                    <p>
                      {view === 'receptor'
                        ? `${MOLECULES[round.type].name}: la molecola si è sollevata dal disco. I tre gruppi inferiori corrispondono alle tasche; il quarto è rivolto verso l’alto. L’ordine speculare dell’altra molecola non coincide.`
                        : `${MOLECULES[round.type].name}: quattro zone coincidenti. L’enantiomero opposto ne può far coincidere al massimo due attraverso sole rotazioni.`}
                    </p>
                    {finished && (
                      <p>
                        Partita completata: {score} / {TOTAL} punti.
                      </p>
                    )}
                  </div>
                  <button
                    ref={nextButton}
                    className={styles.primary}
                    type="button"
                    onClick={() => newRound(finished)}
                  >
                    {finished ? 'Gioca ancora' : 'Prossimo turno →'}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className={styles.welcome}>
              <div className={styles.mark}>La natura ha una destra e una sinistra.</div>
              <p>
                Guarda le tue mani: sono immagini speculari, ma non puoi sovrapporle perfettamente.
                Anche alcune molecole esistono in due versioni così: stessi atomi e stessi legami,
                ma una diversa disposizione nello spazio. Questa proprietà si chiama{' '}
                <strong>chiralità</strong>.
              </p>
              <p>
                È un tema centrale nella chimica della vita, tornato al centro dell’attenzione con
                il <strong>Nobel per la Chimica 2026</strong>, assegnato a Henri Kagan e Kenso Soai
                per scoperte che aiutano a capire come una delle due forme speculari possa prevalere
                nelle reazioni chimiche.
              </p>
              <p>
                La differenza si può persino annusare. Una forma del <strong>carvone</strong> odora
                di <strong>menta</strong>; la sua immagine speculare odora di{' '}
                <strong>cumino dei prati</strong>. I recettori del nostro naso interagiscono
                diversamente con le due forme e inviano al cervello combinazioni di segnali diverse,
                che riconosciamo come odori differenti.
              </p>
              <p>
                Non è la stessa molecola che cambia odore a seconda del recettore: sono due forme
                speculari che il nostro olfatto sa distinguere. Il gioco rende visibile questa idea
                attraverso modelli geometrici semplificati.
              </p>
              <p>
                <a
                  href="https://www.rsc.org/news/nobel-prize-for-chemistry-2026"
                  target="_blank"
                  rel="noreferrer"
                >
                  Il Nobel 2026 raccontato dalla Royal Society of Chemistry
                </a>
              </p>
              <button className={styles.primary} type="button" onClick={() => newRound(true)}>
                Inizia la sfida
              </button>
            </div>
          )}
        </article>
        {candidate('B')}
      </div>
      <div
        className={styles.progress}
        aria-label={`${history.length} turni completati su ${TOTAL}`}
      >
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={i < history.length ? (history[i] ? styles.correct : styles.incorrect) : ''}
            aria-label={`Turno ${i + 1}: ${i >= history.length ? 'da giocare' : history[i] ? 'corretto' : 'errato'}`}
          >
            {i < history.length ? (history[i] ? '✓' : '×') : i + 1}
          </span>
        ))}
      </div>
      <details className={styles.explanation}>
        <summary>Come leggere i due modelli</summary>
        <p>
          Nella modalità disco estraiamo casualmente uno dei due recettori speculari e mostriamo la
          molecola compatibile inserita. Il recettore non è nominato: le tasche indicano i tre
          gruppi nascosti, mentre il quarto gruppo è visibile sopra il centro C*. Ruota la scena e
          confronta la disposizione dei quattro gruppi con i riferimenti. Dopo la scelta la molecola
          viene sollevata. Le sfere rappresentano gruppi ai vertici; nella modalità stampo i colori
          identificano invece le facce. Sono due analogie geometriche distinte.
        </p>
        <p>
          Lo stampo è mostrato come un involucro tetraedrico trasparente. Ogni anello identifica una
          zona su una parete interna: deve ricevere la faccia con lo stesso colore e la stessa
          lettera. Le zone sono mostrate nella stessa convenzione spaziale delle molecole, senza
          riflessioni della vista.
        </p>
        <p>
          Una rotazione può far coincidere tutte le quattro zone di una molecola compatibile. Per
          l’enantiomero opposto il massimo è due: quando allinei due zone, le altre due restano
          scambiate.
        </p>
        <p>
          Il (R)-carvone ha odore di menta verde, il (S)-carvone di carvi o cumino dei prati. Qui
          tetraedri, colori e stampi sono analogie geometriche, non strutture molecolari complete o
          recettori biologici reali. L’associazione delle colorazioni a R e S è una convenzione del
          gioco; le lettere non indicano priorità chimiche.
        </p>
        <p>
          <a
            href="https://www.acs.org/molecule-of-the-week/archive/c/s-carvone.html"
            target="_blank"
            rel="noreferrer"
          >
            Fonte: American Chemical Society — carvone
          </a>
        </p>
      </details>
    </section>
  );
}
