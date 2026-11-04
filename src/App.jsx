import React, { useState, useEffect } from 'react';
import './App.css';
import { getRecommendation as getRecommendationFromHistory } from './recommendation.js';
import { getWeekSummary, getProgress, getLastNote, formatDate } from './stats.js';
import WeekView from './WeekView';
import ProgressChart from './ProgressChart';
import { getExerciseType, parseDuration } from './exerciseTypes.js';

const DRAFT_KEY = 'savvy_lift_active_workout';
const HISTORY_CACHE_KEY = 'savvy_lift_history_cache';

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Smith bulgarialainen', 'Bulgarian Smith', 'Smith bulgarian split', 'Bulgarialainen', 'Bulgarian'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla', 'DB Bulgarian split squat'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi', 'Jalkaprässi vaakatasossa'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Pystyprässi'],
  'Vertical Row': ['Vertical Row machine', 'Pystysoutu laite'],
  'Low Row (kaapeli)': ['Alasoutu kaapeli', 'Kaapelisoutu', 'Alasoutu laite'],
  'Chest Press (laite) Lucas': ['Chest Press machine', 'Rintapunnerrus laite'],
  'Chest Press (laite)': ['Chest Press machine', 'Rintapunnerrus laite'],
  'Vinopenkki laitteessa': ['Vinopenkki laite', 'Incline press machine'],
  'Pec Deck': ['Pecdeck', 'Rintapekki'],
  'Arnold Press': ['Arnold pystypunnerrus'],
  'Pystypunnerrus laitteessa': ['Shoulder press machine', 'Pystypunnerruslaite'],
  'Pystypunnerrus käsipainoilla': ['Pystypunnerrus kp', 'Dumbbell shoulder press'],
  'Vipunostot sivulle': ['Lateral raise machine', 'Sivuvivut laite'],
  'Vipunostot käsipainoilla': ['Vipunostot kp', 'Lateral raise DB'],
  'Pystysoutu leveällä': ['Pystysoutu levytangolla', 'Upright row wide'],
  'Hammer Curl': ['Hauiskääntö hammer', 'Hammer hauis'],
  'Hauiskääntö käsipainoilla': ['Hauiskääntö kp', 'Dumbbell curl'],
  'Push Down': ['Ojentajapunnerrus taljassa', 'Pushdown'],
  'Ojentajat käsipainoilla': ['Ojentajapunnerrus kp', 'Triceps extension DB'],
  'Reiden loitonnus (abductor)': ['Abductor machine', 'Loitonnuslaite'],
  'Reiden lähennys (adductor)': ['Adductor machine', 'Lähennyslaite'],
  'Vatsarutistus laitteessa': ['Vatsarutistuslaite', 'Ab crunch machine'],
  'Lankku': ['Plank static'],
  'Glute Drive': ['Booty Builder laite', 'Lantionnosto laite'],
  'Lantionnosto käsipainoilla': ['Hip thrust kp', 'Lantionnosto kp'],
  'Reiden ojennus': ['Leg extension machine', 'Reisiojennus'],
  'Reiden koukistus': ['Leg curl machine', 'Reisikoukistus'],
  'Lat Pulldown (laite)': ['Ylätalja', 'Ylätalja laite'],
  'Lat Pulldown (kaapeli)': ['Ylätalja kaapeli', 'Kaapeliylätalja', 'Ylätalja leveä'],
  'SJMV': ['Suorin jaloin maastaveto kp', 'RDL'],
  'Penkkipunnerrus käsipainoilla': ['Käsipainopenkki', 'DB bench press'],
  'Yhden käden soutu käsipainoilla': ['Yhden käden soutu kp', 'One arm row DB'],
  'Askelkyykky käsipainoilla': ['Askelkyykky kp', 'Dumbbell lunge'],
  'Vatsarutistus jumppapallolla': ['Swiss ball crunch', 'Crunch jumppapallolla'],
  'Jalkojen nostot selinmakuulla': ['Leg raise', 'Leg raises'],
  'Russian twist': ['Russian twists'],
  'Istumaannousu lisäpainon kanssa': ['Weighted sit up', 'Sit up lisäpainolla'],
  'Face Pull': ['Face pull', 'Facepull', 'Kasvoveto taljassa'],
  'Takaolkapäät laitteessa': ['Reverse pec deck', 'Takaolkapäälaite'],
  'Vipunostot taakse': ['Reverse fly käsipainoilla', 'Takaolkapääviparit'],
  'Reverse Fly': ['Reverse fly', 'Takaolkapää reverse fly']
};

// MUUTETTU VAIN TREENIRAKENNE: A/B -> A/B/C
const WORKOUT_DATA = {
  A: [
    {
      id: 'a1',
      name: 'Smith Bulgarian Split Squat',
      muscle: 'Jalat',
      alternatives: [
        'Bulgarian Split Squat käsipainoilla',
        'Askelkyykky käsipainoilla'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'a2',
      name: 'Chest Press (laite)',
      muscle: 'Rinta',
      alternatives: [
        'Penkkipunnerrus käsipainoilla',
        'Pec Deck'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'a3',
      name: 'Low Row (kaapeli)',
      muscle: 'Selkä',
      alternatives: [
        'Yhden käden soutu käsipainoilla',
        'Vertical Row'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'a4',
      name: 'Reiden ojennus',
      muscle: 'Etureidet',
      alternatives: [
        'Jalkaprässi – vaakaprässi'
      ],
      targetReps: '12-15',
      increment: 2.5
    },
    {
      id: 'a5',
      name: 'Vipunostot sivulle',
      muscle: 'Olkapäät',
      alternatives: [
        'Pystysoutu leveällä'
      ],
      targetReps: '12-15',
      increment: 0.5
    },
    {
      id: 'a6',
      name: 'Russian twist',
      muscle: 'Core',
      alternatives: [
        'Vatsarutistus jumppapallolla',
        'Istumaannousu lisäpainon kanssa'
      ],
      targetReps: '12-20',
      increment: 1.0
    }
  ],

  B: [
    {
      id: 'b1',
      name: 'Glute Drive',
      muscle: 'Pakarat',
      alternatives: [
        'Lantionnosto tangolla',
        'Lantionnosto käsipainoilla'
      ],
      targetReps: '6-8',
      increment: 5.0
    },
    {
      id: 'b2',
      name: 'Jalkaprässi (pystysuora / 45°)',
      muscle: 'Jalat',
      alternatives: [
        'Jalkaprässi – vaakaprässi',
        'Reiden ojennus'
      ],
      targetReps: '8-10',
      increment: 5.0
    },
    {
      id: 'b3',
      name: 'Lat Pulldown (laite)',
      muscle: 'Selkä',
      alternatives: [
        'Lat Pulldown (kaapeli)',
        'Vertical Row',
        'Low Row (kaapeli)',
        'Yhden käden soutu käsipainoilla'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'b4',
      name: 'Yhden käden pystypunnerrus istuen',
      muscle: 'Olkapäät',
      alternatives: [
        'Arnold Press',
        'Pystypunnerrus käsipainoilla',
        'Penkkipunnerrus käsipainoilla'
      ],
      targetReps: '8-10',
      increment: 1.0
    },
    {
      id: 'b5',
      name: 'Voimapyörä',
      muscle: 'Core',
      alternatives: [
        'Dead Bug'
      ],
      targetReps: '10-15',
      increment: 1.0
    }
  ],

  C: [
    {
      id: 'c1',
      name: 'SJMV',
      muscle: 'Takaketju',
      alternatives: [
        'Selänojennus lisäpainolla',
        'Reiden koukistus'
      ],
      targetReps: '8-10',
      increment: 5.0
    },
    {
      id: 'c2',
      name: 'Vinopenkki laitteessa',
      muscle: 'Rinta',
      alternatives: [
        'Chest Press (laite)',
        'Penkkipunnerrus käsipainoilla',
        'Pec Deck'
      ],
      targetReps: '8-10',
      increment: 2.5
    },
    {
      id: 'c3',
      name: 'Vertical Row',
      muscle: 'Selkä',
      alternatives: [
        'Low Row (kaapeli)',
        'Lat Pulldown (laite)',
        'Lat Pulldown (kaapeli)',
        'Yhden käden soutu käsipainoilla'
      ],
      targetReps: '8-10',
      increment: 2.5
    },
    {
      id: 'c4',
      name: 'Face Pull',
      muscle: 'Takaolkapää',
      alternatives: [
        'Takaolkapäät laitteessa',
        'Vipunostot taakse'
      ],
      targetReps: '12-15',
      increment: 1.0
    },
    {
      id: 'c5',
      name: 'Push Down',
      muscle: 'Ojentajat',
      alternatives: [
        'Ojentajat käsipainoilla'
      ],
      targetReps: '12-15',
      increment: 2.5
    },
    {
      id: 'c6',
      name: 'Jalkojen nostot selinmakuulla',
      muscle: 'Core',
      alternatives: [
        'Vatsarutistus jumppapallolla',
        'Istumaannousu lisäpainon kanssa'
      ],
      targetReps: '10-15',
      increment: 1.0
    }
  ]
};

// Liikkeitä jotka eivät ole minkään treenipäivän pääliike, mutta löytyvät silti
// "+ LISÄÄ LIIKE" -valikosta. Lisää tähän uusia rivejä sitä mukaa kun liikkeitä tulee lisää.
const EXTRA_EXERCISES = [
  { name: 'Bulgarian Split Squat käsipainoilla', muscle: 'Jalat', targetReps: '6-8', increment: 2.5 },
  { name: 'Askelkyykky käsipainoilla', muscle: 'Jalat', targetReps: '8-10', increment: 2.5 },
  { name: 'Jalkaprässi – vaakaprässi', muscle: 'Jalat', targetReps: '8-10', increment: 5.0 },
  { name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0 },
  { name: 'Reiden lähennys (adductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0 },
  { name: 'Lantionnosto tangolla', muscle: 'Pakarat', targetReps: '6-8', increment: 5.0 },
  { name: 'Lantionnosto käsipainoilla', muscle: 'Pakarat', targetReps: '8-10', increment: 2.5 },
  { name: 'Reiden koukistus', muscle: 'Takareidet', targetReps: '10-12', increment: 2.5 },
  { name: 'Penkkipunnerrus käsipainoilla', muscle: 'Rinta', targetReps: '6-8', increment: 2.5 },
  { name: 'Pec Deck', muscle: 'Rinta', targetReps: '10-12', increment: 2.5 },
  { name: 'Lat Pulldown (kaapeli)', muscle: 'Selkä', targetReps: '6-8', increment: 2.5 },
  { name: 'Yhden käden soutu käsipainoilla', muscle: 'Selkä', targetReps: '8-10', increment: 2.5 },
  { name: 'Selänojennus lisäpainolla', muscle: 'Alaselkä', targetReps: '10-15', increment: 2.5 },
  { name: 'Arnold Press', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0 },
  { name: 'Pystypunnerrus käsipainoilla', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0 },
  { name: 'Pystypunnerrus laitteessa', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0 },
  { name: 'Vipunostot käsipainoilla', muscle: 'Olkapäät', targetReps: '12-15', increment: 0.5 },
  { name: 'Pystysoutu leveällä', muscle: 'Olkapäät', targetReps: '12-15', increment: 1.0 },
  { name: 'Takaolkapäät laitteessa', muscle: 'Takaolkapää', targetReps: '12-15', increment: 1.0 },
  { name: 'Vipunostot taakse', muscle: 'Takaolkapää', targetReps: '12-15', increment: 1.0 },
  { name: 'Reverse Fly', muscle: 'Takaolkapää', targetReps: '12-15', increment: 1.0 },
  { name: 'Hammer Curl', muscle: 'Hauis', targetReps: '10-12', increment: 1.0 },
  { name: 'Hauiskääntö käsipainoilla', muscle: 'Hauis', targetReps: '10-12', increment: 1.0 },
  { name: 'Ojentajat käsipainoilla', muscle: 'Ojentajat', targetReps: '12-15', increment: 1.0 },
  { name: 'Vatsarutistus laitteessa', muscle: 'Core', targetReps: '12-15', increment: 2.5 },
  { name: 'Vatsarutistus jumppapallolla', muscle: 'Core', targetReps: '12-20', increment: 1.0 },
  { name: 'Istumaannousu lisäpainon kanssa', muscle: 'Core', targetReps: '12-20', increment: 2.5 },
  { name: 'Lankku', muscle: 'Core', targetReps: '30-60', increment: 0 }, // aika sekunteina
  { name: 'Dead Bug', muscle: 'Core', targetReps: '20-30', increment: 0 }
];

// Kaikki tunnetut liikkeet (treenipäivien pääliikkeet + yllä olevat lisäliikkeet) yhteen
// listaan koottuna, treenipäivien versiot ovat aina totuuden lähde (mm. niiden omat SWAP-vaihtoehdot säilyvät).
const ALL_EXERCISES = (() => {
  const byName = new Map();
  [...WORKOUT_DATA.A, ...WORKOUT_DATA.B, ...WORKOUT_DATA.C].forEach(ex => {
    byName.set(ex.name, { name: ex.name, muscle: ex.muscle, targetReps: ex.targetReps, increment: ex.increment, alternatives: ex.alternatives || [] });
  });
  EXTRA_EXERCISES.forEach(ex => {
    if (!byName.has(ex.name)) byName.set(ex.name, { ...ex, alternatives: ex.alternatives || [] });
  });
  return Array.from(byName.values());
})();

const MUSCLE_ORDER = ['Jalat', 'Pakarat', 'Lantio', 'Rinta', 'Selkä', 'Takaketju', 'Alaselkä', 'Olkapäät', 'Takaolkapää', 'Hauis', 'Ojentajat', 'Core'];

// Liikkeet ryhmiteltynä lihasryhmittäin "+ LISÄÄ LIIKE" -valikon osioita varten.
// Lihasryhmät, joita ei ole MUSCLE_ORDERissa (esim. Etureidet, Takareidet), tulevat
// listan loppuun, jotta mikään liike ei jää valikosta pois.
const EXERCISE_GROUPS = [
  ...MUSCLE_ORDER,
  ...[...new Set(ALL_EXERCISES.map(ex => ex.muscle))].filter(m => !MUSCLE_ORDER.includes(m))
]
  .map(muscle => ({ muscle, exercises: ALL_EXERCISES.filter(ex => ex.muscle === muscle) }))
  .filter(group => group.exercises.length > 0);

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Historia näytetään heti puhelimen välimuistista, ja tuore versio haetaan Sheetistä taustalla.
  const [sheetsHistory, setSheetsHistory] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) || '[]');
      return Array.isArray(cached) ? cached : [];
    } catch { return []; }
  });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [expandedMuscle, setExpandedMuscle] = useState(null);
  const [chartFor, setChartFor] = useState(null);   // liikkeen nimi, jonka kehityskäyrä on auki
  const [showWeek, setShowWeek] = useState(false);  // viikkonäkymä treenin aikana

  const API_URL = "https://script.google.com/macros/s/AKfycbztsRf-a7P1H29fxHOX3xy_ydwWN_RiX9qbGlGlb7EXEbkduJrdKwYOPjVOQXc3Qyp-/exec";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const rows = Array.isArray(data) ? data : [];
        setSheetsHistory(rows);
        try { localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(rows)); } catch { /* välimuisti ei pakollinen */ }
      })
      .finally(() => setHistoryLoading(false))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  // Suosituslogiikka on omassa tiedostossaan (src/recommendation.js), jotta sen voi
  // testata erikseen historiaa vasten. Se vain lukee historiaa eikä muuta mitään.
  const getRecommendation = (name, range, obj) =>
    getRecommendationFromHistory(sheetsHistory, name, range, obj.increment, EXERCISE_DICTIONARY, Date.now(), getExerciseType(name));

  const weekSummary = getWeekSummary(sheetsHistory, ALL_EXERCISES, EXERCISE_DICTIONARY, activeWorkout);

  const chartModal = chartFor && (
    <ProgressChart
      name={chartFor}
      progress={getProgress(sheetsHistory, chartFor, EXERCISE_DICTIONARY)}
      type={getExerciseType(chartFor)}
      onClose={() => setChartFor(null)}
    />
  );

  const startWorkout = (type) => {
    setActiveWorkout({
      type,
      exercises: WORKOUT_DATA[type].map(ex => ({
        ...ex,
        currentName: ex.name,
        sets: [{ weight: '', reps: '' }]
      }))
    });
  };

  const removeExercise = (id) => {
    if (!window.confirm("Poistetaanko liike?")) return;
    setActiveWorkout(p => ({ ...p, exercises: p.exercises.filter(e => e.id !== id) }));
  };

  const addExercise = (selected) => {
    const newEx = {
      ...selected,
      id: `extra_${Date.now()}`,
      currentName: selected.name,
      sets: [{ weight: '', reps: '' }]
    };
    setActiveWorkout(p => ({ ...p, exercises: [...p.exercises, newEx] }));
    setShowAddExercise(false);
    setExpandedMuscle(null);
  };

  if (!activeWorkout) {
    return (
      <div className="container center-view">
        <div className="main-logo-box"><h1 className="glock-text savvy-logo">SAVVY LIFT</h1></div>
        <div className="start-actions">
          <button className="workout-select-btn a-btn" onClick={() => startWorkout('A')}>TREENI A</button>
          <button className="workout-select-btn b-btn" onClick={() => startWorkout('B')}>TREENI B</button>
          <button className="workout-select-btn c-btn" onClick={() => startWorkout('C')}>TREENI C</button>
        </div>
        <WeekView summary={weekSummary} muscleOrder={MUSCLE_ORDER} loading={historyLoading} />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-card">
        <h1 className="glock-text">{activeWorkout.type}-TREENI</h1>
        <button className="cancel-btn" onClick={() => {
           if(window.confirm("Lopetetaanko treeni?")) { 
             localStorage.removeItem(DRAFT_KEY);
             setActiveWorkout(null); 
           }
        }}>✕</button>
      </header>

      <main className="workout-list">
        <button className="add-set-pill week-toggle" onClick={() => setShowWeek(s => !s)}>
          {showWeek ? '▾' : '▸'} TÄMÄ VIIKKO
        </button>
        {showWeek && <WeekView summary={weekSummary} muscleOrder={MUSCLE_ORDER} loading={historyLoading} compact />}

        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps, ex);
          const lastNote = getLastNote(sheetsHistory, ex.currentName, EXERCISE_DICTIONARY);
          const exType = getExerciseType(ex.currentName);
          // Kehonpaino- ja aikaliikkeissä kg-kenttä näkyy vain, jos lisäpaino on otettu käyttöön.
          const showWeight = exType === 'weight' || ex.extraLoad || ex.sets.some(s => s.weight !== '' && s.weight !== undefined);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <div style={{ flex: 1 }}>
                  <span className="muscle-tag">{ex.muscle}</span>
                  <h2 className="exercise-title">{ex.currentName}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <button className="swap-action-btn" onClick={() => {
                    const opts = [ex.name, ...(ex.alternatives || [])];
                    const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
                    setActiveWorkout(p => ({
                      ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, currentName: opts[next] } : e)
                    }));
                  }}>SWAP</button>
                  <button className="swap-action-btn" style={{background: 'var(--bento-blue)'}} onClick={() => setChartFor(ex.currentName)}>KEHITYS</button>
                  <button className="swap-action-btn" style={{background: '#fee2e2', color: '#b91c1c'}} onClick={() => removeExercise(ex.id)}>POISTA</button>
                </div>
              </div>

              <div className={`stats-hint ${info.status}`}>{info.text}</div>
              {lastNote && (
                <div className="last-note">📝 {formatDate(lastNote.time)}: {lastNote.note}</div>
              )}

              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i + 1}.</span>
                    {showWeight && (
                      <input type="number" step="any" placeholder={exType === 'weight' ? 'kg' : '+kg'} value={set.weight} onChange={e => {
                        const v = e.target.value;
                        setActiveWorkout(p => ({
                          ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, weight: v } : s) } : e)
                        }));
                      }}/>
                    )}
                    {exType === 'time' ? (
                      <input type="text" inputMode="decimal" placeholder="0:45"
                        className={set.reps && parseDuration(set.reps) === null ? 'input-invalid' : ''}
                        value={set.reps} onChange={e => {
                        const v = e.target.value;
                        setActiveWorkout(p => ({
                          ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: v } : s) } : e)
                        }));
                      }}/>
                    ) : (
                      <input type="number" placeholder="reps" value={set.reps} onChange={e => {
                        const v = e.target.value;
                        setActiveWorkout(p => ({
                          ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: v } : s) } : e)
                        }));
                      }}/>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-set-pill" onClick={() => {
                const last = ex.sets[ex.sets.length-1];
                setActiveWorkout(p => ({
                  ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: [...e.sets, { weight: last.weight, reps: '' }] } : e)
                }));
              }}>+ LISÄÄ SARJA</button>
              {!showWeight && (
                <button className="add-set-pill extra-load-btn" onClick={() => setActiveWorkout(p => ({
                  ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, extraLoad: true } : e)
                }))}>+ LISÄPAINO</button>
              )}
              <input
                type="text"
                className="note-input"
                placeholder="Muistiinpano (esim. olkapää tuntui, kone varattu)"
                value={ex.notes || ''}
                onChange={e => {
                  const v = e.target.value;
                  setActiveWorkout(p => ({
                    ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, notes: v } : e)
                  }));
                }}
              />
            </div>
          );
        })}

        {!showAddExercise && <button className="add-set-pill" style={{marginTop: 20}} onClick={() => setShowAddExercise(true)}>+ LISÄÄ LIIKE</button>}
        {showAddExercise && (
          <div className="exercise-card" style={{marginTop: 20}}>
             <h2 className="exercise-title">Valitse uusi liike:</h2>
             <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 15}}>
               {EXERCISE_GROUPS.map(group => (
                 <div key={group.muscle}>
                   <button
                     className="add-set-pill"
                     style={{width: '100%', textAlign: 'left', fontWeight: 700}}
                     onClick={() => setExpandedMuscle(m => m === group.muscle ? null : group.muscle)}
                   >
                     {expandedMuscle === group.muscle ? '▾' : '▸'} {group.muscle} ({group.exercises.length})
                   </button>
                   {expandedMuscle === group.muscle && (
                     <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginLeft: 12}}>
                       {group.exercises.map(ex => (
                         <button key={ex.name} className="add-set-pill" onClick={() => addExercise(ex)}>{ex.name}</button>
                       ))}
                     </div>
                   )}
                 </div>
               ))}
               <button className="cancel-btn" style={{position: 'static', width: '100%', marginTop: 10}} onClick={() => { setShowAddExercise(false); setExpandedMuscle(null); }}>PERU</button>
             </div>
          </div>
        )}
      </main>

      <button className="main-save-btn" onClick={async () => {
        const badTime = activeWorkout.exercises.find(ex =>
          getExerciseType(ex.currentName) === 'time' && ex.sets.some(s => s.reps && parseDuration(s.reps) === null));
        if (badTime) {
          alert(`Tarkista aika liikkeessä ${badTime.currentName}. Kirjoita esim. 1:24 tai 45.`);
          return;
        }
        if (!window.confirm("Tallennetaanko?")) return;
        const payload = activeWorkout.exercises.map(ex => {
          const d = {
            Aikaleima: new Date().toLocaleDateString('fi-FI') + " " + new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
            workoutType: activeWorkout.type,
            musclegroup: ex.muscle,
            exercisename: ex.currentName,
          };
          // Muistiinpano Sheetin olemassa olevaan notes-sarakkeeseen. Heittomerkki estää
          // Sheetsiä tulkitsemasta =- tai +-alkuista tekstiä kaavaksi.
          if (ex.notes && ex.notes.trim()) d.notes = "'" + ex.notes.trim();
          const saveType = getExerciseType(ex.currentName);
          ex.sets.forEach((s, i) => {
            if (i < 5) {
              // Aikaliikkeissä "1:24" tallennetaan sekunteina (84) toistosarakkeeseen.
              const repsValue = saveType === 'time' ? parseDuration(s.reps) : s.reps;
              d[`s${i + 1}_reps`] = repsValue !== null && repsValue !== '' && repsValue !== undefined ? "'" + repsValue : "";
              d[`s${i + 1}_weight`] = s.weight ? "'" + s.weight : "";
            }
          });
          return d;
        });

        try {
          const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
          const text = await res.text();
          if (!res.ok || !text.includes("Success")) {
            throw new Error(text || `HTTP ${res.status}`);
          }
          alert("Tallennettu!");
          localStorage.removeItem(DRAFT_KEY);
          setActiveWorkout(null);
        } catch (e) {
          alert("Tallennus epäonnistui! Treeni EI kadonnut — se on yhä tallessa täällä puhelimessasi, ja voit yrittää tallentaa uudelleen (esim. paremmalla verkolla). Virhe: " + e.message);
        }
      }}>TALLENNA TREENI</button>
      {chartModal}
    </div>
  );
}

export default App;