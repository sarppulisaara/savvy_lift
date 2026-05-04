import React, { useState, useEffect } from 'react';
import './App.css'; 

const DRAFT_KEY = 'savvy_lift_active_workout';

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky', 'Smith bulgarialainen'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Prässi'],
  'Vertical Row': ['Vertical row'],
  'Low Row (kaapeli)': ['Low Row', 'Kaapelisoutu', 'Soutu kaapelissa'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press'],
  'Vinopenkki laitteessa': ['Vinopenkki', 'Incline press', 'Incline'],
  'Pec Deck': ['Pecdeck', 'Rintapekki', 'Rintapec'],
  'Arnold Press': ['Arnold'],
  'Pystypunnerrus laitteessa': ['Pystypunnerrus', 'Shoulder press'],
  'Pystypunnerrus käsipainoilla': ['Pystypunnerrus kp'],
  'Vipunostot sivulle': ['Sivuvipu', 'Vipunostot', 'Lateral raise'],
  'Vipunostot käsipainoilla': ['Vipunostot kp', 'Sivuvipu kp'],
  'Pystysoutu leveällä': ['Pystysoutu', 'Upright row'],
  'Hammer Curl': ['Hauis', 'Hammer'],
  'Hauiskääntö käsipainoilla': ['Hauiskääntö', 'Dumbbell curl', 'DB curl'],
  'Push Down': ['Ojentajat', 'Pushdown'],
  'Ojentajat käsipainoilla': ['Ranskalainen punnerrus', 'Triceps extension'],
  'Reiden loitonnus (abductor)': ['Abductor', 'Loitonnus'],
  'Reiden lähennys (adductor)': ['Adductor'],
  'Vatsarutistus laitteessa': ['Vatsat', 'Ab crunch', 'Vatsat laitteessa'],
  'Lankku': ['Plank'],
  'Glute Drive': ['Booty Builder', 'Lantionnosto', 'Glute drive', 'Booty Builder -laite'],
  'Lantionnosto käsipainoilla': ['Hip thrust käsipainoilla'],
  'Reiden ojennus': ['Ojennus', 'Leg extension'],
  'Reiden koukistus': ['Koukistus', 'Leg curl', 'Reiden koukistus istuen'],
  'Lat Pulldown': ['Ylätalja', 'Lat pulldown'],
  'SJMV': ['Suorin jaloin maastaveto', 'Romanian deadlift', 'RDL', 'SJMV kp'],
  'Penkkipunnerrus käsipainoilla': ['Penkkipunnerrus kp', 'Käsipainopenkki', 'DB penkki'],
  'Yhden käden soutu käsipainoilla': ['Yhden käden soutu kp', 'Käsipainosoutu'],
  'Askelkyykky käsipainoilla': ['Askelkyykky kp', 'Askelkyykky'],
  'Jalkojen nosto roikkuen': ['Hanging leg raise'],
  'Vatsarutistus jumppapallolla': ['Swiss ball crunch', 'Crunch jumppapallolla'],
  'Jalkojen nostot selinmakuulla': ['Leg raise', 'Leg raises'],
  'Russian twist': ['Russian twists'],
  'Istumaannousu lisäpainon kanssa': ['Weighted sit up', 'Sit up lisäpainolla']
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
        'Vinopenkki laitteessa',
        'Pec Deck',
        'Penkkipunnerrus käsipainoilla'
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
        'Lat Pulldown',
        'Yhden käden soutu käsipainoilla'
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
        'Arnold Press',
        'Pystysoutu leveällä',
        'Vipunostot käsipainoilla'
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
        'SJMV',
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
      name: 'Vatsarutistus laitteessa',
      muscle: 'Core',
      alternatives: [
        'Lankku',
        'Jalkojen nosto roikkuen',
        'Vatsarutistus jumppapallolla',
        'Jalkojen nostot selinmakuulla',
        'Russian twist',
        'Istumaannousu lisäpainon kanssa'
      ],
      targetReps: '15-20',
      increment: 2.5
    }
  ]
};

const EXERCISE_BANK = [
  { name: 'Smith Bulgarian Split Squat', muscle: 'Jalat', targetReps: '6-8', increment: 2.5, alternatives: ['Bulgarian Split Squat käsipainoilla', 'Jalkaprässi – vaakaprässi'] },
  { name: 'Bulgarian Split Squat käsipainoilla', muscle: 'Jalat', targetReps: '6-8', increment: 2.5, alternatives: ['Smith Bulgarian Split Squat', 'Jalkaprässi – vaakaprässi'] },
  { name: 'Jalkaprässi – vaakaprässi', muscle: 'Jalat', targetReps: '8-10', increment: 5.0, alternatives: ['Jalkaprässi (pystysuora / 45°)', 'Smith Bulgarian Split Squat'] },
  { name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Jalat', targetReps: '8-10', increment: 5.0, alternatives: ['Jalkaprässi – vaakaprässi', 'Smith Bulgarian Split Squat'] },
  { name: 'Reiden ojennus', muscle: 'Jalat', targetReps: '12-15', increment: 2.5, alternatives: ['Jalkaprässi – vaakaprässi'] },
  { name: 'Reiden koukistus', muscle: 'Takareidet', targetReps: '10-12', increment: 2.5, alternatives: ['SJMV', 'Glute Drive'] },
  { name: 'Glute Drive', muscle: 'Pakarat', targetReps: '6-8', increment: 5.0, alternatives: ['SJMV', 'Lantionnosto käsipainoilla'] },
  { name: 'SJMV', muscle: 'Takareidet', targetReps: '8-10', increment: 5.0, alternatives: ['Reiden koukistus', 'Glute Drive'] },

  { name: 'Chest Press (laite)', muscle: 'Rinta', targetReps: '6-8', increment: 2.5, alternatives: ['Vinopenkki laitteessa', 'Pec Deck', 'Penkkipunnerrus käsipainoilla'] },
  { name: 'Penkkipunnerrus käsipainoilla', muscle: 'Rinta', targetReps: '6-8', increment: 2.5, alternatives: ['Chest Press (laite)', 'Vinopenkki laitteessa'] },
  { name: 'Vinopenkki laitteessa', muscle: 'Rinta', targetReps: '8-10', increment: 2.5, alternatives: ['Chest Press (laite)', 'Pec Deck'] },
  { name: 'Pec Deck', muscle: 'Rinta', targetReps: '10-12', increment: 2.5, alternatives: ['Chest Press (laite)', 'Vinopenkki laitteessa'] },

  { name: 'Low Row (kaapeli)', muscle: 'Selkä', targetReps: '6-8', increment: 2.5, alternatives: ['Vertical Row', 'Lat Pulldown', 'Yhden käden soutu käsipainoilla'] },
  { name: 'Vertical Row', muscle: 'Selkä', targetReps: '8-10', increment: 2.5, alternatives: ['Low Row (kaapeli)', 'Lat Pulldown'] },
  { name: 'Lat Pulldown', muscle: 'Selkä', targetReps: '6-8', increment: 2.5, alternatives: ['Vertical Row', 'Low Row (kaapeli)'] },
  { name: 'Yhden käden soutu käsipainoilla', muscle: 'Selkä', targetReps: '8-10', increment: 2.5, alternatives: ['Low Row (kaapeli)', 'Vertical Row'] },

  { name: 'Pystypunnerrus laitteessa', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0, alternatives: ['Arnold Press', 'Pystypunnerrus käsipainoilla'] },
  { name: 'Pystypunnerrus käsipainoilla', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0, alternatives: ['Pystypunnerrus laitteessa', 'Arnold Press'] },
  { name: 'Arnold Press', muscle: 'Olkapäät', targetReps: '8-10', increment: 1.0, alternatives: ['Pystypunnerrus laitteessa'] },
  { name: 'Vipunostot sivulle', muscle: 'Olkapäät', targetReps: '12-15', increment: 0.5, alternatives: ['Vipunostot käsipainoilla', 'Pystysoutu leveällä'] },
  { name: 'Vipunostot käsipainoilla', muscle: 'Olkapäät', targetReps: '12-15', increment: 0.5, alternatives: ['Vipunostot sivulle', 'Pystysoutu leveällä'] },
  { name: 'Pystysoutu leveällä', muscle: 'Olkapäät', targetReps: '12-15', increment: 1.0, alternatives: ['Vipunostot sivulle', 'Vipunostot käsipainoilla'] },

  { name: 'Hammer Curl', muscle: 'Hauis', targetReps: '10-12', increment: 1.0, alternatives: ['Hauiskääntö käsipainoilla'] },
  { name: 'Hauiskääntö käsipainoilla', muscle: 'Hauis', targetReps: '10-12', increment: 1.0, alternatives: ['Hammer Curl'] },
  { name: 'Push Down', muscle: 'Ojentajat', targetReps: '12-15', increment: 2.5, alternatives: ['Ojentajat käsipainoilla'] },
  { name: 'Ojentajat käsipainoilla', muscle: 'Ojentajat', targetReps: '12-15', increment: 1.0, alternatives: ['Push Down'] },

  { name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0, alternatives: ['Reiden lähennys (adductor)'] },
  { name: 'Reiden lähennys (adductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0, alternatives: ['Reiden loitonnus (abductor)'] },

  { name: 'Vatsarutistus laitteessa', muscle: 'Core', targetReps: '15-20', increment: 2.5, alternatives: ['Lankku', 'Jalkojen nosto roikkuen', 'Russian twist'] },
  { name: 'Lankku', muscle: 'Core', targetReps: '30-60', increment: 5.0, alternatives: ['Vatsarutistus laitteessa'] },
  { name: 'Jalkojen nosto roikkuen', muscle: 'Core', targetReps: '12-15', increment: 1.0, alternatives: ['Jalkojen nostot selinmakuulla', 'Vatsarutistus laitteessa'] },
  { name: 'Jalkojen nostot selinmakuulla', muscle: 'Core', targetReps: '12-15', increment: 1.0, alternatives: ['Jalkojen nosto roikkuen', 'Vatsarutistus laitteessa'] },
  { name: 'Vatsarutistus jumppapallolla', muscle: 'Core', targetReps: '15-20', increment: 1.0, alternatives: ['Vatsarutistus laitteessa'] },
  { name: 'Russian twist', muscle: 'Core', targetReps: '12-20', increment: 1.0, alternatives: ['Vatsarutistus jumppapallolla'] },
  { name: 'Istumaannousu lisäpainon kanssa', muscle: 'Core', targetReps: '10-15', increment: 1.0, alternatives: ['Vatsarutistus laitteessa'] }
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
      .then(data => setSheetsHistory(data))
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
      const rawName = h.Liike || h.liike || h.exercisename || h.exerciseName || "";
      const hName = normalizeName(rawName);
      return searchTerms.some(term => hName === term);
    });

    if (relevant.length === 0) {
      return { text: "Ei historiaa, syötä aloituspaino", status: 'normal' };
    }

    const last = relevant[relevant.length - 1];
    const w = parseNum(last.Paino || last.paino || last.s1_weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const maxR = parseInt(String(range).split('-').pop(), 10);

    if (w === 0) return { text: "Viimeksi: -", status: 'normal' };

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
    if (window.confirm("Keskeytetäänkö treeni? Tallentamattomat tiedot poistuvat.")) {
      localStorage.removeItem(DRAFT_KEY);
      setActiveWorkout(null);
      setShowAddExercise(false);
    }
  };

  const removeExercise = (id) => {
    if (!window.confirm("Poistetaanko tämä liike vain tämän päivän treenistä?")) return;

    setActiveWorkout(p => ({
      ...p,
      exercises: p.exercises.filter(e => e.id !== id)
    }));
  };

  const addExercise = (selected) => {
    const newExercise = {
      ...selected,
      id: `extra_${Date.now()}`,
      currentName: selected.name,
      sets: [{ weight: '', reps: '' }]
    };

    setActiveWorkout(p => ({
      ...p,
      exercises: [...p.exercises, newExercise]
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="swap-action-btn"
                    onClick={() => {
                      const opts = [ex.name, ...ex.alternatives];
                      const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
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
                  setActiveWorkout(p => ({
                    ...p,
                    exercises: p.exercises.map(e =>
                      e.id === ex.id
                        ? {
                            ...e,
                            sets: [...e.sets, { weight: e.sets[e.sets.length - 1].weight, reps: '' }]
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
            onClick={() => setShowAddExercise(true)}
          >
            + LISÄÄ LIIKE
          </button>
        )}

        {showAddExercise && (
          <div className="exercise-card">
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
              {EXERCISE_BANK.map((bankExercise) => (
                <button
                  key={bankExercise.name}
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
              exercisename: ex.currentName,
              s1_reps: ex.sets[0]?.reps ? "'" + ex.sets[0].reps : "",
              s1_weight: ex.sets[0]?.weight ? "'" + ex.sets[0].weight : ""
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
            alert("Virhe tallennuksessa.");
          }
        }}
      >
        TALLENNA TREENI
      </button>
    </div>
  );
}

export default App;