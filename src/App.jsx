import React, { useState, useEffect } from 'react';
import './App.css'; 

const DRAFT_KEY = 'savvy_lift_active_workout';

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky', 'Smith bulgarialainen', 'Bulgarian Smith', 'Smith bulgarian split'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla', 'DB Bulgarian split squat'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi', 'Jalkaprässi vaakatasossa'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Prässi', 'Pystyprässi'],
  'Vertical Row': ['Vertical row', 'Vertical Row machine', 'Pystysoutu laite'],
  'Low Row (kaapeli)': ['Low Row', 'Alasoutu kaapeli', 'Kaapelisoutu', 'Alasoutu laite', 'Soutu kaapelissa'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press', 'Chest Press machine', 'Rintapunnerrus laite'],
  'Vinopenkki laitteessa': ['Vinopenkki', 'Incline press', 'Incline', 'Vinopenkki laite', 'Incline press machine'],
  'Pec Deck': ['Pecdeck', 'Rintapekki', 'Rintapec'],
  'Arnold Press': ['Arnold', 'Arnold press', 'Arnold pystypunnerrus'],
  'Pystypunnerrus laitteessa': ['Pystypunnerrus', 'Shoulder press', 'Shoulder press machine', 'Pystypunnerruslaite'],
  'Pystypunnerrus käsipainoilla': ['Pystypunnerrus kp', 'Dumbbell shoulder press'],
  'Vipunostot sivulle': ['Sivuvipu', 'Vipunostot', 'Lateral raise', 'Lateral raise machine', 'Sivuvivut laite'],
  'Vipunostot käsipainoilla': ['Vipunostot kp', 'Sivuvipu kp', 'Lateral raise DB'],
  'Pystysoutu leveällä': ['Pystysoutu', 'Upright row', 'Pystysoutu levytangolla', 'Upright row wide'],
  'Hammer Curl': ['Hauis', 'Hammer', 'Hauiskääntö hammer', 'Hammer hauis'],
  'Hauiskääntö käsipainoilla': ['Hauiskääntö', 'Dumbbell curl', 'DB curl', 'Hauiskääntö kp'],
  'Push Down': ['Ojentajat', 'Pushdown', 'Ojentajapunnerrus taljassa'],
  'Ojentajat käsipainoilla': ['Ranskalainen punnerrus', 'Triceps extension', 'Ojentajapunnerrus kp', 'Triceps extension DB'],
  'Reiden loitonnus (abductor)': ['Abductor', 'Loitonnus', 'Abductor machine', 'Loitonnuslaite'],
  'Reiden lähennys (adductor)': ['Adductor', 'Adductor machine', 'Lähennyslaite'],
  'Vatsarutistus laitteessa': ['Vatsat', 'Ab crunch', 'Vatsat laitteessa', 'Vatsarutistuslaite', 'Ab crunch machine'],
  'Lankku': ['Plank', 'Plank static'],
  'Glute Drive': ['Booty Builder', 'Lantionnosto', 'Glute drive', 'Booty Builder -laite', 'Booty Builder laite', 'Lantionnosto laite'],
  'Lantionnosto käsipainoilla': ['Hip thrust käsipainoilla', 'Hip thrust kp', 'Lantionnosto kp'],
  'Reiden ojennus': ['Ojennus', 'Leg extension', 'Leg extension machine', 'Reisiojennus'],
  'Reiden koukistus': ['Koukistus', 'Leg curl', 'Reiden koukistus istuen', 'Leg curl machine', 'Reisikoukistus'],
  'Lat Pulldown': ['Ylätalja', 'Lat pulldown', 'Ylätalja leveä'],
  'SJMV': ['Suorin jaloin maastaveto', 'Romanian deadlift', 'RDL', 'SJMV kp', 'Suorin jaloin maastaveto kp'],
  'Penkkipunnerrus käsipainoilla': ['Penkkipunnerrus kp', 'Käsipainopenkki', 'DB penkki', 'DB bench press'],
  'Yhden käden soutu käsipainoilla': ['Yhden käden soutu kp', 'Käsipainosoutu', 'One arm row DB'],
  'Askelkyykky käsipainoilla': ['Askelkyykky kp', 'Askelkyykky', 'Dumbbell lunge'],
  'Vatsarutistus jumppapallolla': ['Swiss ball crunch', 'Crunch jumppapallolla'],
  'Jalkojen nostot selinmakuulla': ['Leg raise', 'Leg raises'],
  'Russian twist': ['Russian twists'],
  'Istumaannousu lisäpainon kanssa': ['Weighted sit up', 'Sit up lisäpainolla'],
  'Face Pull': ['Face pull', 'Facepull', 'Kasvoveto taljassa'],
  'Takaolkapäät laitteessa': ['Reverse pec deck', 'Takaolkapäälaite'],
  'Vipunostot taakse': ['Reverse fly käsipainoilla', 'Takaolkapääviparit'],
  'Reverse Fly': ['Reverse fly', 'Takaolkapää reverse fly']
};

const WORKOUT_DATA = {
  A: [
    {
      id: 'a1',
      name: 'Smith Bulgarian Split Squat',
      muscle: 'Jalat',
      alternatives: [
        'Bulgarian Split Squat käsipainoilla',
        'Jalkaprässi – vaakaprässi',
        'Jalkaprässi (pystysuora / 45°)'
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
        'Vinopenkki laitteessa',
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
        'Vertical Row',
        'Yhden käden soutu käsipainoilla',
        'Lat Pulldown'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'a4',
      name: 'Reiden koukistus',
      muscle: 'Takareidet',
      alternatives: [
        'SJMV',
        'Glute Drive'
      ],
      targetReps: '10-12',
      increment: 2.5
    },
    {
      id: 'a5',
      name: 'Vipunostot sivulle',
      muscle: 'Olkapäät',
      alternatives: [
        'Vipunostot käsipainoilla',
        'Pystysoutu leveällä',
        'Arnold Press'
      ],
      targetReps: '12-15',
      increment: 0.5
    },
    {
      id: 'a6',
      name: 'Vatsarutistus laitteessa',
      muscle: 'Core',
      alternatives: [
        'Lankku',
        'Vatsarutistus jumppapallolla',
        'Istumaannousu lisäpainon kanssa'
      ],
      targetReps: '15-20',
      increment: 2.5
    }
  ],

  B: [
    {
      id: 'b1',
      name: 'Glute Drive',
      muscle: 'Pakarat',
      alternatives: [
        'Lantionnosto käsipainoilla',
        'SJMV'
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
        'Smith Bulgarian Split Squat',
        'Askelkyykky käsipainoilla'
      ],
      targetReps: '8-10',
      increment: 5.0
    },
    {
      id: 'b3',
      name: 'Lat Pulldown',
      muscle: 'Selkä',
      alternatives: [
        'Vertical Row',
        'Low Row (kaapeli)',
        'Yhden käden soutu käsipainoilla'
      ],
      targetReps: '6-8',
      increment: 2.5
    },
    {
      id: 'b4',
      name: 'Pystypunnerrus laitteessa',
      muscle: 'Olkapäät',
      alternatives: [
        'Arnold Press',
        'Pystypunnerrus käsipainoilla'
      ],
      targetReps: '8-10',
      increment: 1.0
    },
    {
      id: 'b5',
      name: 'Hammer Curl',
      muscle: 'Hauis',
      alternatives: [
        'Hauiskääntö käsipainoilla'
      ],
      targetReps: '10-12',
      increment: 1.0
    },
    {
      id: 'b6',
      name: 'Lankku',
      muscle: 'Core',
      alternatives: [
        'Vatsarutistus laitteessa',
        'Jalkojen nostot selinmakuulla',
        'Russian twist'
      ],
      targetReps: '30-60',
      increment: 5.0
    }
  ],

  C: [
    {
      id: 'c1',
      name: 'SJMV',
      muscle: 'Takaketju',
      alternatives: [
        'Reiden koukistus',
        'Glute Drive'
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
        'Yhden käden soutu käsipainoilla',
        'Lat Pulldown'
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
        'Vipunostot taakse',
        'Reverse Fly'
      ],
      targetReps: '12-15',
      increment: 1.0
    },
    {
      id: 'c5',
      name: 'Jalkojen nostot selinmakuulla',
      muscle: 'Core',
      alternatives: [
        'Lankku',
        'Vatsarutistus laitteessa',
        'Russian twist'
      ],
      targetReps: '10-15',
      increment: 1.0
    },
    {
      id: 'c6',
      name: 'Russian twist',
      muscle: 'Core',
      alternatives: [
        'Vatsarutistus jumppapallolla',
        'Istumaannousu lisäpainon kanssa',
        'Lankku'
      ],
      targetReps: '12-20',
      increment: 1.0
    },
    {
      id: 'c7',
      name: 'Push Down',
      muscle: 'Ojentajat',
      alternatives: [
        'Ojentajat käsipainoilla'
      ],
      targetReps: '12-15',
      increment: 2.5
    }
  ]
};

const EXERCISE_BANK = [
  ...WORKOUT_DATA.A,
  ...WORKOUT_DATA.B,
  ...WORKOUT_DATA.C,
  {
    id: 'bank_reiden_ojennus',
    name: 'Reiden ojennus',
    muscle: 'Jalat',
    targetReps: '12-15',
    increment: 2.5,
    alternatives: ['Jalkaprässi – vaakaprässi']
  },
  {
    id: 'bank_abductor',
    name: 'Reiden loitonnus (abductor)',
    muscle: 'Lantio',
    targetReps: '12-15',
    increment: 5.0,
    alternatives: ['Reiden lähennys (adductor)']
  },
  {
    id: 'bank_adductor',
    name: 'Reiden lähennys (adductor)',
    muscle: 'Lantio',
    targetReps: '12-15',
    increment: 5.0,
    alternatives: ['Reiden loitonnus (abductor)']
  }
];

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sheetsHistory, setSheetsHistory] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  
  const API_URL = "https://script.google.com/macros/s/AKfycbxK9_ZncVDu9_R4FqzxbFv3S2Bpc9ot9q-abq5yCfF2UxajM-r3cTT9RuQjJLFbK7dY/exec"; 

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSheetsHistory(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  const normalizeName = (value) => {
    return String(value || '').toLowerCase().trim();
  };

  const parseNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace("'", "").replace(',', '.').trim());
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (name, range, obj) => {
    const aliases = EXERCISE_DICTIONARY[name] || [];
    const searchTerms = [name, ...aliases].map(normalizeName);

    const relevant = sheetsHistory.filter(h => {
      const rawName = h.Liike || h.liike || h.exercisename || h.exerciseName || h.ExerciseName || "";
      const hName = normalizeName(rawName);
      return searchTerms.some(term => hName === term);
    });

    if (relevant.length === 0) {
      return { text: "Ei historiaa", status: 'normal' };
    }

    const last = relevant[relevant.length - 1];
    const w = parseNum(last.Paino || last.paino || last.s1_weight || last.Weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps || last.Reps);
    const maxR = parseInt(String(range).split('-').pop(), 10);

    if (w === 0) {
      return { text: "Viimeksi: -", status: 'normal' };
    }

    return r >= maxR
      ? { text: `Suositus: ${(w + obj.increment).toFixed(1).replace('.0', '')}kg (Viimeksi ${w}kg x ${r})`, status: 'level-up' }
      : { text: `Viimeksi: ${w}kg x ${r}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    const newWorkout = {
      type,
      exercises: WORKOUT_DATA[type].map(ex => ({
        ...ex,
        currentName: ex.name,
        sets: [{ weight: '', reps: '' }]
      }))
    };

    setActiveWorkout(newWorkout);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(newWorkout));
  };

  const cancelWorkout = () => {
    if (window.confirm("Lopetetaanko treeni? Tallentamattomat tiedot poistuvat.")) {
      localStorage.removeItem(DRAFT_KEY);
      setActiveWorkout(null);
      setShowAddExercise(false);
    }
  };

  const removeExercise = (id) => {
    if (!window.confirm("Poistetaanko liike vain tämän päivän treenistä?")) return;

    setActiveWorkout(p => ({
      ...p,
      exercises: p.exercises.filter(e => e.id !== id)
    }));
  };

  const addExercise = (selected) => {
    const newEx = {
      ...selected,
      id: `extra_${Date.now()}`,
      currentName: selected.name,
      sets: [{ weight: '', reps: '' }]
    };

    setActiveWorkout(p => ({
      ...p,
      exercises: [...p.exercises, newEx]
    }));

    setShowAddExercise(false);
  };

  if (!activeWorkout) {
    return (
      <div className="container center-view">
        <div className="main-logo-box">
          <h1 className="glock-text savvy-logo">SAVVY LIFT</h1>
        </div>

        <div className="start-actions">
          <button className="workout-select-btn a-btn" onClick={() => startWorkout('A')}>TREENI A</button>
          <button className="workout-select-btn b-btn" onClick={() => startWorkout('B')}>TREENI B</button>
          <button className="workout-select-btn c-btn" onClick={() => startWorkout('C')}>TREENI C</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-card">
        <h1 className="glock-text">{activeWorkout.type}-TREENI</h1>
        <button className="cancel-btn" onClick={cancelWorkout}>✕</button>
      </header>

      <main className="workout-list">
        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps, ex);

          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <div style={{ flex: 1 }}>
                  <span className="muscle-tag">{ex.muscle}</span>
                  <h2 className="exercise-title">{ex.currentName}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <button
                    className="swap-action-btn"
                    onClick={() => {
                      const opts = [ex.name, ...(ex.alternatives || [])];
                      const currentIndex = opts.indexOf(ex.currentName);
                      const next = (currentIndex + 1) % opts.length;

                      setActiveWorkout(p => ({
                        ...p,
                        exercises: p.exercises.map(e =>
                          e.id === ex.id ? { ...e, currentName: opts[next] } : e
                        )
                      }));
                    }}
                  >
                    SWAP
                  </button>

                  <button
                    className="swap-action-btn"
                    style={{ background: '#fee2e2', color: '#b91c1c' }}
                    onClick={() => removeExercise(ex.id)}
                  >
                    POISTA
                  </button>
                </div>
              </div>

              <div className={`stats-hint ${info.status}`}>{info.text}</div>

              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i + 1}.</span>

                    <input
                      type="number"
                      step="any"
                      placeholder="kg"
                      value={set.weight}
                      onChange={e => {
                        const v = e.target.value;
                        setActiveWorkout(p => ({
                          ...p,
                          exercises: p.exercises.map(e =>
                            e.id === ex.id
                              ? {
                                  ...e,
                                  sets: e.sets.map((s, idx) =>
                                    idx === i ? { ...s, weight: v } : s
                                  )
                                }
                              : e
                          )
                        }));
                      }}
                    />

                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={e => {
                        const v = e.target.value;
                        setActiveWorkout(p => ({
                          ...p,
                          exercises: p.exercises.map(e =>
                            e.id === ex.id
                              ? {
                                  ...e,
                                  sets: e.sets.map((s, idx) =>
                                    idx === i ? { ...s, reps: v } : s
                                  )
                                }
                              : e
                          )
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                className="add-set-pill"
                onClick={() => {
                  const last = ex.sets[ex.sets.length - 1];

                  setActiveWorkout(p => ({
                    ...p,
                    exercises: p.exercises.map(e =>
                      e.id === ex.id
                        ? {
                            ...e,
                            sets: [...e.sets, { weight: last.weight, reps: '' }]
                          }
                        : e
                    )
                  }));
                }}
              >
                + LISÄÄ SARJA
              </button>
            </div>
          );
        })}

        {!showAddExercise && (
          <button
            className="add-set-pill"
            style={{ marginTop: 20 }}
            onClick={() => setShowAddExercise(true)}
          >
            + LISÄÄ LIIKE
          </button>
        )}

        {showAddExercise && (
          <div className="exercise-card" style={{ marginTop: 20 }}>
            <div className="exercise-header">
              <div style={{ flex: 1 }}>
                <span className="muscle-tag">Lisäliike</span>
                <h2 className="exercise-title">Valitse liike</h2>
              </div>

              <button
                className="swap-action-btn"
                onClick={() => setShowAddExercise(false)}
              >
                PERU
              </button>
            </div>

            <div className="sets-container">
              {EXERCISE_BANK.map((bankExercise, index) => (
                <button
                  key={`${bankExercise.name}_${index}`}
                  className="add-set-pill"
                  onClick={() => addExercise(bankExercise)}
                >
                  {bankExercise.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <button
        className="main-save-btn"
        onClick={async () => {
          if (!window.confirm("Tallennetaanko?")) return;

          const payload = activeWorkout.exercises.map(ex => {
            const d = {
              Aikaleima: new Date().toLocaleDateString('fi-FI') + " " + new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
              workoutType: activeWorkout.type,
              musclegroup: ex.muscle,
              exercisename: ex.currentName
            };

            ex.sets.forEach((s, i) => {
              if (i < 5) {
                d[`s${i + 1}_reps`] = s.reps ? "'" + s.reps : "";
                d[`s${i + 1}_weight`] = s.weight ? "'" + s.weight : "";
              }
            });

            return d;
          });

          try {
            await fetch(API_URL, {
              method: "POST",
              mode: 'no-cors',
              body: JSON.stringify(payload)
            });

            alert("Tallennettu!");
            localStorage.removeItem(DRAFT_KEY);
            setActiveWorkout(null);
            setShowAddExercise(false);
          } catch (e) {
            alert("Virhe!");
          }
        }}
      >
        TALLENNA TREENI
      </button>
    </div>
  );
}

export default App;