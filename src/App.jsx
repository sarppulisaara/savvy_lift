import React, { useState, useEffect } from 'react';
import './App.css'; 

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky', 'Smith bulgarialainen'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Prässi'],
  'Vertical Row': ['Alasoutu', 'Low Row', 'Soutu'],
  'Low Row (kaapeli)': ['Low Row', 'Kaapelisoutu', 'Soutu kaapelissa'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press'],
  'Vinopenkki laitteessa': ['Vinopenkki', 'Incline press', 'Incline'],
  'Pec Deck': ['Pecdeck', 'Rintapekki', 'Rintapec'],
  'Arnold Press': ['Arnold'],
  'Pystypunnerrus laitteessa': ['Pystypunnerrus', 'Shoulder press'],
  'Vipunostot sivulle': ['Sivuvipu', 'Vipunostot', 'Lateral raise'],
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
  'Reiden ojennus': ['Ojennus', 'Leg extension'],
  'Reiden koukistus': ['Koukistus', 'Leg curl'],
  'Lat Pulldown': ['Ylätalja', 'Lat pulldown'],
  'SJMV': ['Suorin jaloin maastaveto', 'Romanian deadlift', 'RDL']
};

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Smith Bulgarian Split Squat', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '8-10', increment: 2.5 },
    { id: 'a2', name: 'Chest Press (laite)', muscle: 'Rinta', alternatives: ['Vinopenkki laitteessa', 'Pec Deck'], targetReps: '10-12', increment: 2.5 },
    { id: 'a3', name: 'Low Row (kaapeli)', muscle: 'Selkä', alternatives: ['Vertical Row', 'Lat Pulldown'], targetReps: '10-12', increment: 2.5 },
    { id: 'a4', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV', 'Glute Drive'], targetReps: '12-15', increment: 2.5 },
    { id: 'a5', name: 'Vipunostot sivulle', muscle: 'Sivuolkapää', alternatives: ['Arnold Press', 'Pystysoutu leveällä'], targetReps: '12-15', increment: 0.5 },
    { id: 'a6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 }
  ],
  B: [
    { id: 'b1', name: 'SJMV', muscle: 'Takareidet', alternatives: ['Glute Drive', 'Reiden koukistus'], targetReps: '8-10', increment: 5.0 },
    { id: 'b2', name: 'Lat Pulldown', muscle: 'Yläselkä', alternatives: ['Vertical Row', 'Low Row (kaapeli)'], targetReps: '10-12', increment: 2.5 },
    { id: 'b3', name: 'Pystypunnerrus laitteessa', muscle: 'Olkapäät', alternatives: ['Arnold Press'], targetReps: '10-12', increment: 1.0 },
    { id: 'b4', name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '10-12', increment: 5.0 },
    { id: 'b5', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauiskääntö käsipainoilla'], targetReps: '10-12', increment: 1.0 },
    { id: 'b6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 }
  ],
  C: [
    { id: 'c1', name: 'Jalkaprässi – vaakaprässi', muscle: 'Etureidet', alternatives: ['Glute Drive', 'Smith Bulgarian Split Squat'], targetReps: '10-12', increment: 5.0 },
    { id: 'c2', name: 'Vinopenkki laitteessa', muscle: 'Rinta', alternatives: ['Chest Press (laite)', 'Pec Deck'], targetReps: '10-12', increment: 2.5 },
    { id: 'c3', name: 'Vertical Row', muscle: 'Selkä', alternatives: ['Low Row (kaapeli)', 'Lat Pulldown'], targetReps: '10-12', increment: 2.5 },
    { id: 'c4', name: 'Reiden ojennus', muscle: 'Etureidet', alternatives: ['Smith Bulgarian Split Squat'], targetReps: '12-15', increment: 2.5 },
    { id: 'c5', name: 'Push Down', muscle: 'Ojentajat', alternatives: ['Ojentajat käsipainoilla'], targetReps: '12-15', increment: 2.5 },
    { id: 'c6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 }
  ],
  D: [
    { id: 'd1', name: 'Glute Drive', muscle: 'Pakarat', alternatives: ['SJMV', 'Booty Builder -laite'], targetReps: '8-10', increment: 5.0 },
    { id: 'd2', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV'], targetReps: '10-12', increment: 2.5 },
    { id: 'd3', name: 'Lat Pulldown', muscle: 'Yläselkä', alternatives: ['Low Row (kaapeli)', 'Vertical Row'], targetReps: '10-12', increment: 2.5 },
    { id: 'd4', name: 'Arnold Press', muscle: 'Olkapäät', alternatives: ['Pystypunnerrus laitteessa'], targetReps: '10-12', increment: 1.0 },
    { id: 'd5', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauiskääntö käsipainoilla'], targetReps: '10-12', increment: 1.0 },
    { id: 'd6', name: 'Vipunostot sivulle', muscle: 'Sivuolkapää', alternatives: ['Pystysoutu leveällä'], targetReps: '12-15', increment: 0.5 },
    { id: 'd7', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 },
    { id: 'd8', name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', alternatives: ['Reiden lähennys (adductor)'], targetReps: '12-15', increment: 5.0 }
  ]
};

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    const saved = localStorage.getItem('active_workout');
    return saved ? JSON.parse(saved) : null;
  });
  const [sheetsHistory, setSheetsHistory] = useState([]);
  
  const API_URL = "https://script.google.com/macros/s/AKfycbxhmF1_C5q6intFIBvECvYKH6D1-u_UmYBrotic-ggWWDu99IWVYhle8ArlJJB4XhfR/exec"; 

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => setSheetsHistory(data)).catch(err => console.error(err));
  }, []);

  const parseNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace("'", "").replace(',', '.').trim());
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (name, range, obj) => {
    const aliases = EXERCISE_DICTIONARY[name] || [];
    const searchTerms = [name, ...aliases].map(n => n.toLowerCase().trim());
    const relevant = sheetsHistory.filter(h => {
      const hName = String(h.Liike || h.liike || h.exercisename || "").toLowerCase().trim();
      return searchTerms.some(term => hName === term || hName.includes(term) || term.includes(hName));
    });
    if (relevant.length === 0) return { text: "Ei historiaa", status: 'normal' };
    const last = relevant[relevant.length - 1]; 
    const w = parseNum(last.Paino || last.paino || last.s1_weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const maxR = parseInt(range.split('-').pop());
    if (w === 0) return { text: "Viimeksi: -", status: 'normal' };
    return r >= maxR 
      ? { text: `Suositus: ${(w + obj.increment).toFixed(1).replace('.0', '')}kg (Viimeksi ${w}kg x ${r})`, status: 'level-up' }
      : { text: `Viimeksi: ${w}kg x ${r}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    setActiveWorkout({ type, exercises: WORKOUT_DATA[type].map(ex => ({ ...ex, currentName: ex.name, sets: [{ weight: '', reps: '' }] })) });
  };

  if (!activeWorkout) {
    return (
      <div className="container center-view">
        <h1 className="glock-text">SAVVY LIFT</h1>
        <div className="start-actions">
          {['A', 'B', 'C', 'D'].map(type => (
            <button key={type} className={`workout-select-btn ${type.toLowerCase()}-btn`} onClick={() => startWorkout(type)}>
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-card">
        <h1 className="glock-text">{activeWorkout.type}-TREENI</h1>
        <button className="cancel-btn" onClick={() => setActiveWorkout(null)}>✕</button>
      </header>
      <main className="workout-list">
        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps, ex);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <div style={{flex: 1}}>
                  <span className="muscle-tag">{ex.muscle}</span>
                  <h2 className="exercise-title">{ex.currentName}</h2>
                </div>
                <button className="swap-action-btn" onClick={() => {
                  const opts = [ex.name, ...ex.alternatives];
                  const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
                  setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, currentName: opts[next] } : e) }));
                }}>SWAP</button>
              </div>
              <div className={`stats-hint ${info.status}`}>{info.text}</div>
              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i+1}.</span>
                    <input type="number" step="any" placeholder="kg" value={set.weight} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, weight: v } : s) } : e) }));
                    }} />
                    <input type="number" placeholder="reps" value={set.reps} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: v } : s) } : e) }));
                    }} />
                  </div>
                ))}
              </div>
              <button className="add-set-pill" onClick={() => {
                setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: [...e.sets, { weight: e.sets[e.sets.length-1].weight, reps: '' }] } : e) }));
              }}>+ LISÄÄ SARJA</button>
            </div>
          );
        })}
      </main>
      <button className="main-save-btn" onClick={async () => {
        if (!window.confirm("Tallennetaanko?")) return;
        const payload = activeWorkout.exercises.map(ex => ({
          Aikaleima: new Date().toLocaleDateString('fi-FI') + " " + new Date().toLocaleTimeString('fi-FI', {hour: '2-digit', minute:'2-digit'}),
          workoutType: activeWorkout.type, 
          musclegroup: ex.muscle, 
          exercisename: ex.currentName,
          s1_reps: ex.sets[0].reps ? "'" + ex.sets[0].reps : "",
          s1_weight: ex.sets[0].weight ? "'" + ex.sets[0].weight : ""
        }));
        try {
          await fetch(API_URL, { method: "POST", mode: 'no-cors', body: JSON.stringify(payload) });
          alert("Tallennettu!"); setActiveWorkout(null);
        } catch (e) { alert("Virhe."); }
      }}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;