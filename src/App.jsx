import React, { useState, useEffect } from 'react';
import './App.css'; 

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 astetta'],
  'Vertical Row': ['Alasoutu', 'Low Row', 'Soutulaite'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press'],
  'Arnold Press': ['Arnold'],
  'Hammer Curl': ['Hauiskääntö', 'Hauis'],
  'Reiden loitonnus (abductor)': ['Abductor', 'Loitonnus'],
  'Vatsarutistus laitteessa': ['Vatsat'],
  'Glute Drive': ['Booty Builder -laite', 'Lantionnosto'],
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
    { id: 'a5', name: 'Vipunostot sivulle', muscle: 'Sivuolkapää', alternatives: ['Vipunostot taljassa'], targetReps: '12-15', increment: 0.5 },
    { id: 'a6', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV kp'], targetReps: '12-15', increment: 2.5 },
    { id: 'a7', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauis taljassa'], targetReps: '10-12', increment: 1.0 },
    { id: 'a8', name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', alternatives: ['Reiden lähennys (adductor)'], targetReps: '12-15', increment: 5.0 }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', alternatives: ['Booty Builder -laite'], targetReps: '8-10', increment: 5.0 },
    { id: 'b2', name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '10-12', increment: 5.0 },
    { id: 'b3', name: 'Vertical Row', muscle: 'Selkä', alternatives: ['Low Row (kaapeli)'], targetReps: '10-12', increment: 2.5 },
    { id: 'b4', name: 'Reiden ojennus', muscle: 'Etureidet', alternatives: ['Askelkyykky kp'], targetReps: '12-15', increment: 2.5 },
    { id: 'b5', name: 'Push Down', muscle: 'Ojentajat', alternatives: ['Pec Deck'], targetReps: '12-15', increment: 2.5 },
    { id: 'b6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku'], targetReps: '15-20', increment: 2.5 }
  ]
};

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    const saved = localStorage.getItem('active_workout');
    return saved ? JSON.parse(saved) : null;
  });
  const [sheetsHistory, setSheetsHistory] = useState([]);
  
  // TÄRKEÄÄ: Pasteaa tähän se sun Apps Script URL (esim. https://script.google.com/...)
  const API_URL = "https://script.google.com/macros/s/AKfycbxhmF1_C5q6intFIBvECvYKH6D1-u_UmYBrotic-ggWWDu99IWVYhle8ArlJJB4XhfR/exec"; 

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => setSheetsHistory(data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeWorkout) localStorage.setItem('active_workout', JSON.stringify(activeWorkout));
  }, [activeWorkout]);

  const parseNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (currentName, targetRange, exerciseObj) => {
    const aliases = EXERCISE_DICTIONARY[currentName] || [];
    const searchTerms = [currentName, ...aliases].map(n => n.toLowerCase().trim());
    const relevantHistory = sheetsHistory.filter(h => {
      const hName = (h.Liike || h.liike || h.exercisename || "").toLowerCase().trim();
      return searchTerms.some(term => hName === term);
    });
    if (relevantHistory.length === 0) return { text: "Ei historiaa", status: 'normal' };
    const last = relevantHistory[relevantHistory.length - 1]; 
    const weight = parseNum(last.Paino || last.paino || last.s1_weight);
    const reps = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const step = exerciseObj.increment || 2.5;
    const targetMax = parseInt(targetRange.split('-').pop());
    if (weight === 0) return { text: "Viimeksi: -", status: 'normal' };
    return reps >= targetMax 
      ? { text: `Suositus: ${weight + step}kg (Viimeksi ${weight}kg x ${reps})`, status: 'level-up' }
      : { text: `Viimeksi: ${weight}kg x ${reps}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    setActiveWorkout({ type, exercises: WORKOUT_DATA[type].map(ex => ({ ...ex, currentName: ex.name, sets: [{ weight: '', reps: '' }] })), startTime: new Date().toLocaleString('fi-FI') });
  };

  const updateSet = (id, i, f, v) => {
    setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(ex => ex.id === id ? { ...ex, sets: ex.sets.map((s, idx) => idx === i ? { ...s, [f]: v } : s) } : ex) }));
  };

  const addSet = (id) => {
    setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(ex => ex.id === id ? { ...ex, sets: [...ex.sets, { weight: ex.sets[ex.sets.length-1].weight, reps: '' }] } : ex) }));
  };

  const deleteSet = (exId, setIndex) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === exId && ex.sets.length > 1) return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
        return ex;
      })
    }));
  };

  const swapExercise = (id) => {
    setActiveWorkout(p => ({ ...p, exercises: p.exercises.map(ex => {
      if (ex.id === id) {
        const opts = [ex.name, ...ex.alternatives];
        const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
        return { ...ex, currentName: opts[next] };
      }
      return ex;
    })}));
  };

  const saveToSheets = async () => {
    if (!window.confirm("Tallennetaanko?")) return;
    const payload = activeWorkout.exercises.map(ex => {
      const d = { Aikaleima: new Date().toLocaleString('fi-FI'), workoutType: activeWorkout.type, musclegroup: ex.muscle, exercisename: ex.currentName, notes: "" };
      ex.sets.forEach((set, i) => { if (i < 5) { d[`s${i+1}_reps`] = set.reps; d[`s${i+1}_weight`] = set.weight; }});
      return d;
    });
    try {
      const response = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
      if (response.ok || response.type === 'opaque') { alert("Tallennettu!"); localStorage.removeItem('active_workout'); setActiveWorkout(null); }
    } catch (e) { alert("Tallennusvirhe."); }
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
        <button className="cancel-btn" onClick={() => { if(window.confirm("Hylätäänkö treeni?")) { localStorage.removeItem('active_workout'); setActiveWorkout(null); }}}>✕</button>
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
                <button className="swap-action-btn" onClick={() => swapExercise(ex.id)}>SWAP</button>
              </div>
              <div className={`stats-hint ${info.status}`}>{info.text}</div>
              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i+1}.</span>
                    <input type="number" step="any" placeholder="kg" value={set.weight} onChange={e => updateSet(ex.id, i, 'weight', e.target.value)} />
                    <input type="number" placeholder="reps" value={set.reps} onChange={e => updateSet(ex.id, i, 'reps', e.target.value)} />
                    {ex.sets.length > 1 && <button className="delete-set-btn" onClick={() => deleteSet(ex.id, i)} tabIndex="-1">✕</button>}
                  </div>
                ))}
              </div>
              <button className="add-set-pill" onClick={() => addSet(ex.id)}>+ LISÄÄ SARJA</button>
            </div>
          );
        })}
      </main>
      <button className="main-save-btn" onClick={saveToSheets}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;