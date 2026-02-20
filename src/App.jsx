import React, { useState, useEffect } from 'react';
import './App.css'; 

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi'],
  'Vertical Row': ['Alasoutu', 'Low Row'],
  'Chest Press (laite)': ['Penkkipunnerrus'],
  'Arnold Press': ['Arnold'],
  'Hammer Curl': ['Hauis'],
  'Reiden loitonnus (abductor)': ['Abductor'],
  'Vatsarutistus laitteessa': ['Vatsat'],
  'Glute Drive': ['Booty Builder', 'Lantionnosto'],
  'Reiden ojennus': ['Ojennus'],
  'Reiden koukistus': ['Koukistus'],
  'Push Down': ['Ojentajat'],
  'Lat Pulldown': ['Ylätalja']
};

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Smith Bulgarian Split Squat', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '8-10', increment: 2.5 },
    { id: 'a2', name: 'Arnold Press', muscle: 'Etolkapää', alternatives: ['Pystypunnerrus laitteessa'], targetReps: '10-12', increment: 1.0 },
    { id: 'a3', name: 'Lat Pulldown', muscle: 'Yläselkä', alternatives: ['Leuanvetolaite'], targetReps: '10-12', increment: 2.5 },
    { id: 'a4', name: 'Chest Press (laite)', muscle: 'Rinta', alternatives: ['Vinopenkki laitteessa'], targetReps: '10-12', increment: 2.5 },
    { id: 'a5', name: 'Reiden ojennus', muscle: 'Etureidet', alternatives: ['Askelkyykky kp'], targetReps: '12-15', increment: 2.5 },
    { id: 'a6', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV kp'], targetReps: '12-15', increment: 2.5 },
    { id: 'a7', name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', alternatives: ['Reiden lähennys (adductor)'], targetReps: '12-15', increment: 5.0 }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', alternatives: ['Lantionnosto kp/tanko'], targetReps: '8-10', increment: 5.0 },
    { id: 'b2', name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '10-12', increment: 5.0 },
    { id: 'b3', name: 'Vertical Row', muscle: 'Selkä', alternatives: ['Low Row (kaapeli)'], targetReps: '10-12', increment: 2.5 },
    { id: 'b4', name: 'Vipunostot sivulle', muscle: 'Sivuolkapää', alternatives: ['Vipunostot taljassa'], targetReps: '12-15', increment: 0.5 },
    { id: 'b5', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauis taljassa'], targetReps: '10-12', increment: 1.0 },
    { id: 'b6', name: 'Push Down', muscle: 'Ojentajat', alternatives: ['Pec Deck'], targetReps: '12-15', increment: 2.5 },
    { id: 'b7', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 }
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
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        console.log("Datan haku onnistui. Rivejä haettu:", data.length);
        if (data.length > 0) console.log("Esimerkkirivi historiasta:", data[data.length - 1]);
        setSheetsHistory(data);
      })
      .catch(err => console.error("HISTORIAVIRHE:", err));
  }, []);

  const parseNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (name, range, obj) => {
    const aliases = EXERCISE_DICTIONARY[name] || [];
    const searchTerms = [name, ...aliases].map(n => n.toLowerCase().trim());

    const relevant = sheetsHistory.filter(h => {
      const rawName = h.Liike || h.liike || h.exercisename || h.Harjoitus || "";
      const hName = String(rawName).toLowerCase().trim();
      return searchTerms.some(term => hName === term || hName.includes(term));
    });

    if (relevant.length === 0) return { text: "Ei historiaa", status: 'normal' };
    const last = relevant[relevant.length - 1]; 
    
    const w = parseNum(last.Paino || last.paino || last.s1_weight || last.Weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps || last.Reps);
    
    const maxR = parseInt(range.split('-').pop());
    if (w === 0) return { text: "Viimeksi: -", status: 'normal' };
    
    return r >= maxR 
      ? { text: `Suositus: ${w + obj.increment}kg (Viimeksi ${w}kg x ${r})`, status: 'level-up' }
      : { text: `Viimeksi: ${w}kg x ${r}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    setActiveWorkout({ type, exercises: WORKOUT_DATA[type].map(ex => ({ ...ex, currentName: ex.name, sets: [{ weight: '', reps: '' }] })), startTime: new Date().toLocaleString('fi-FI') });
  };

  if (!activeWorkout) {
    return (
      <div className="container center-view">
        <div className="main-logo-box">
          <h1 className="glock-text">SAVVY LIFT</h1>
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
      <header className="header-card no-sticky">
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
                      const val = e.target.value;
                      setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, weight: val } : s) } : e) }));
                    }} />
                    <input type="number" placeholder="reps" value={set.reps} onChange={e => {
                      const val = e.target.value;
                      setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: val } : s) } : e) }));
                    }} />
                    {ex.sets.length > 1 && <button className="delete-set-btn" onClick={() => {
                      setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.filter((_, idx) => idx !== i) } : e) }));
                    }}>✕</button>}
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
        const payload = activeWorkout.exercises.map(ex => {
          const d = { Aikaleima: new Date().toLocaleString('fi-FI'), workoutType: activeWorkout.type, musclegroup: ex.muscle, exercisename: ex.currentName };
          ex.sets.forEach((s, i) => { if (i < 5) { d[`s${i+1}_reps`] = s.reps; d[`s${i+1}_weight`] = s.weight; }});
          return d;
        });
        try {
          const r = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
          if (r.ok || r.type === 'opaque') { alert("Tallennettu!"); setActiveWorkout(null); }
        } catch (e) { alert("Virhe."); }
      }}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;