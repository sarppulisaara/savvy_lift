import React, { useState, useEffect } from 'react';
import './App.css'; 

const DRAFT_KEY = 'savvy_lift_active_workout';

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Smith bulgarialainen', 'Bulgarian Smith', 'Smith bulgarian split'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla', 'DB Bulgarian split squat'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Pystyprässi'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi', 'Jalkaprässi vaakatasossa'],
  'Lantionnosto tangolla': ['Barbell hip thrust', 'Hip thrust tanko'],
  'Glute Drive': ['Booty Builder laite', 'Lantionnosto laite'],
  'Lantionnosto käsipainoilla': ['Hip thrust kp', 'Lantionnosto kp'],
  'Chest Press (laite)': ['Chest Press machine', 'Rintapunnerrus laite'],
  'Penkkipunnerrus käsipainoilla': ['Käsipainopenkki', 'DB bench press'],
  'Vinopenkki laitteessa': ['Vinopenkki laite', 'Incline press machine'],
  'Pec Deck': ['Pecdeck', 'Rintapekki'],
  'Low Row (kaapeli)': ['Alasoutu kaapeli', 'Kaapelisoutu', 'Alasoutu laite'],
  'Lat Pulldown': ['Ylätalja', 'Ylätalja leveä'],
  'Vertical Row': ['Vertical Row machine', 'Pystysoutu laite'],
  'Yhden käden soutu käsipainoilla': ['Yhden käden soutu kp', 'One arm row DB', 'Yhden käden kulmasoutu'],
  'Reiden ojennus': ['Leg extension machine', 'Reisiojennus'],
  'Reiden koukistus': ['Leg curl machine', 'Reisikoukistus'],
  'SJMV': ['Suorin jaloin maastaveto kp', 'RDL', 'Suorin jaloin maastaveto'],
  'Selänojennus lisäpainolla': ['Hyperextension weighted', 'Selänojennus lisäpainolla'],
  'Yhden käden pystypunnerrus istuen': ['Istuen yhden käden pystypunnerrus kp', 'DB single arm shoulder press'],
  'Arnold Press': ['Arnold pystypunnerrus'],
  'Pystypunnerrus käsipainoilla': ['Pystypunnerrus kp', 'Dumbbell shoulder press'],
  'Vipunostot sivulle': ['Lateral raise machine', 'Sivuvivut laite', 'Vipunostot sivulle kp'],
  'Face Pull': ['Face pull', 'Facepull', 'Kasvoveto taljassa'],
  'Takaolkapäät laitteessa': ['Reverse pec deck', 'Takaolkapäälaite'],
  'Vipunostot taakse': ['Reverse fly käsipainoilla', 'Takaolkapääviparit'],
  'Push Down': ['Ojentajapunnerrus taljassa', 'Pushdown'],
  'Ojentajat käsipainoilla': ['Ojentajapunnerrus kp', 'Triceps extension DB'],
  'Russian twist': ['Russian twists'],
  'Voimapyörä': ['Ab roller', 'Ab wheel'],
  'Dead Bug': ['Kuollut ötökkä'],
  'Jalkojen nostot selinmakuulla': ['Leg raise', 'Leg raises'],
  'Vatsarutistus jumppapallolla': ['Swiss ball crunch', 'Crunch jumppapallolla'],
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
      name: 'Yhden käden pystypunnerrus istuen',
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
      name: 'Reiden koukistus',
      muscle: 'Takareidet',
      alternatives: [
        'SJMV'
      ],
      targetReps: '10-12',
      increment: 2.5
    },
    {
      id: 'b6',
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
        'Lat Pulldown',
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

const EXERCISE_BANK = [
  ...WORKOUT_DATA.A,
  ...WORKOUT_DATA.B,
  ...WORKOUT_DATA.C,
  { name: 'Push Down', muscle: 'Ojentajat', targetReps: '12-15', increment: 2.5, alternatives: ['Ojentajat käsipainoilla'] },
  { name: 'Reiden ojennus', muscle: 'Etureidet', targetReps: '12-15', increment: 2.5, alternatives: ['Jalkaprässi – vaakaprässi'] },
  { name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0, alternatives: ['Reiden lähennys (adductor)'] },
  { name: 'Reiden lähennys (adductor)', muscle: 'Lantio', targetReps: '12-15', increment: 5.0, alternatives: ['Reiden loitonnus (abductor)'] }
];

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [sheetsHistory, setSheetsHistory] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  
  const API_URL = "https://script.google.com/macros/s/AKfycbx0hFtXKOVPLViTVm9vJVFxgauqNGaJasnyybPdYO8Wo0B8rNStPR-TbMPBDh7M7xR8/exec"; 

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

  const parseNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace("'", "").replace(',', '.').trim());
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (name, range, obj) => {
    const aliases = EXERCISE_DICTIONARY[name] || [];
    const searchTerms = [name, ...aliases].map(n => n.toLowerCase().trim());

    const relevant = sheetsHistory.filter(h => {
      const rawName = h.Liike || h.liike || h.exercisename || h.exerciseName || "";
      const hName = String(rawName).toLowerCase().trim();
      return searchTerms.some(term => hName === term || hName.includes(term));
    });

    if (relevant.length === 0) return { text: "Ei historiaa", status: 'normal' };

    const last = relevant[relevant.length - 1];
    const w = parseNum(last.Paino || last.paino || last.s1_weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const maxR = parseInt(range.split('-').pop(), 10);

    if (w === 0) return { text: "Viimeksi: -", status: 'normal' };

    return r >= maxR
      ? { text: `Suositus: ${(w + obj.increment).toFixed(1).replace('.0', '')}kg (Viimeksi ${w}kg x ${r})`, status: 'level-up' }
      : { text: `Viimeksi: ${w}kg x ${r}`, status: 'normal' };
  };

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
                  <button className="swap-action-btn" onClick={() => {
                    const opts = [ex.name, ...(ex.alternatives || [])];
                    const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
                    setActiveWorkout(p => ({
                      ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, currentName: opts[next] } : e)
                    }));
                  }}>SWAP</button>
                  <button className="swap-action-btn" style={{background: '#fee2e2', color: '#b91c1c'}} onClick={() => removeExercise(ex.id)}>POISTA</button>
                </div>
              </div>

              <div className={`stats-hint ${info.status}`}>{info.text}</div>

              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i + 1}.</span>
                    <input type="number" step="any" placeholder="kg" value={set.weight} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({
                        ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, weight: v } : s) } : e)
                      }));
                    }}/>
                    <input type="number" placeholder="reps" value={set.reps} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({
                        ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: v } : s) } : e)
                      }));
                    }}/>
                  </div>
                ))}
              </div>
              <button className="add-set-pill" onClick={() => {
                const last = ex.sets[ex.sets.length-1];
                setActiveWorkout(p => ({
                  ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: [...e.sets, { weight: last.weight, reps: '' }] } : e)
                }));
              }}>+ LISÄÄ SARJA</button>
            </div>
          );
        })}

        {!showAddExercise && <button className="add-set-pill" style={{marginTop: 20}} onClick={() => setShowAddExercise(true)}>+ LISÄÄ LIIKE</button>}
        {showAddExercise && (
          <div className="exercise-card" style={{marginTop: 20}}>
             <h2 className="exercise-title">Valitse uusi liike:</h2>
             <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15}}>
               {EXERCISE_BANK.map(b => (
                 <button key={b.name} className="add-set-pill" onClick={() => addExercise(b)}>{b.name}</button>
               ))}
               <button className="cancel-btn" style={{position: 'static', width: '100%', marginTop: 10}} onClick={() => setShowAddExercise(false)}>PERU</button>
             </div>
          </div>
        )}
      </main>

      <button className="main-save-btn" onClick={async () => {
        if (!window.confirm("Tallennetaanko?")) return;
        const payload = activeWorkout.exercises.map(ex => {
          const d = {
            Aikaleima: new Date().toLocaleDateString('fi-FI') + " " + new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
            workoutType: activeWorkout.type,
            musclegroup: ex.muscle,
            exercisename: ex.currentName,
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
          await fetch(API_URL, { method: "POST", mode: 'no-cors', body: JSON.stringify(payload) });
          alert("Tallennettu!");
          localStorage.removeItem(DRAFT_KEY);
          setActiveWorkout(null);
        } catch (e) { alert("Virhe!"); }
      }}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;