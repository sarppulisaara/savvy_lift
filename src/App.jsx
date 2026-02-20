import React, { useState, useEffect } from 'react';

// 1. SANAKIRJA: Käytetään nyt sinun Excel-nimiäsi "pääavaimina"
const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 astetta'],
  'Vertical Row': ['Alasoutu', 'Low Row'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press'],
  'Arnold Press': ['Arnold'],
  'Hammer Curl': ['Hauiskääntö', 'Hauis'],
  'Reiden ojennus': ['Ojennus'],
  'Reiden koukistus': ['Koukistus'],
  'Vatsarutistus laitteessa': ['Vatsat'],
  'Reiden loitonnus (abductor)': ['Abductor', 'Loitonnus'],
  'Glute Drive': ['Booty Builder -laite', 'Booty Builder'],
  'Push Down': ['Ojentajat'],
  'Lat Pulldown': ['Ylätalja']
};

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Smith Bulgarian Split Squat', muscle: 'Etureidet', alternatives: ['Jalkaprässi – vaakaprässi'], targetReps: '8-10', increment: 2.5 },
    { id: 'a2', name: 'Arnold Press', muscle: 'Etolkapää', alternatives: ['Pystypunnerrus laitteessa'], targetReps: '10-12', increment: 1.0 },
    { id: 'a3', name: 'Lat Pulldown', muscle: 'Yläselkä', alternatives: ['Leuanvetolaite'], targetReps: '10-12', increment: 2.5 },
    { id: 'a4', name: 'Chest Press (laite)', muscle: 'Rinta', alternatives: ['Vinopenkki laitteessa'], targetReps: '10-12', increment: 5.0 },
    { id: 'a5', name: 'Vipunostot sivulle', muscle: 'Sivuolkapää', alternatives: ['Vipunostot taljassa'], targetReps: '12-15', increment: 0.5 },
    { id: 'a6', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV kp'], targetReps: '12-15', increment: 2.5 },
    { id: 'a7', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauis taljassa'], targetReps: '10-12', increment: 1.0 },
    { id: 'a8', name: 'Reiden loitonnus (abductor)', muscle: 'Lantio', alternatives: ['Reiden lähennys (adductor)'], targetReps: '12-15', increment: 5.0 }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', targetReps: '8-10', increment: 5.0 },
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
  
  // TÄRKEÄÄ: Varmista että tämä URL on oikein VS Codessa!
  const API_URL = "https://script.google.com/macros/s/AKfycbxhmF1_C5q6intFIBvECvYKH6D1-u_UmYBrotic-ggWWDu99IWVYhle8ArlJJB4XhfR/exec"; 

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSheetsHistory(data))
      .catch(err => console.error("Haku epäonnistui:", err));
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('active_workout', JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  const parseNum = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    const cleaned = String(val).replace(',', '.').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const getRecommendation = (currentName, targetRange, exerciseObj) => {
    const aliases = EXERCISE_DICTIONARY[currentName] || [];
    const searchTerms = [currentName, ...aliases].map(n => n.toLowerCase().trim());

    const relevantHistory = sheetsHistory.filter(h => {
      const hName = (h.Liike || h.liike || h.exercisename || "").toLowerCase().trim();
      return searchTerms.some(term => hName === term); // Tarkka osuma ensin!
    });

    if (relevantHistory.length === 0) return { text: "Uusi liike / Ei historiaa", status: 'normal' };

    const last = relevantHistory[relevantHistory.length - 1]; 
    const weight = parseNum(last.Paino || last.paino || last.s1_weight);
    const reps = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const targetMax = parseInt(targetRange.split('-').pop());
    const step = exerciseObj.increment || 2.5;

    if (weight === 0) return { text: "Viimeksi: -", status: 'normal' };

    if (reps >= targetMax) {
      return { text: `Suositus: ${weight + step}kg (Viimeksi ${weight}kg x ${reps})`, status: 'level-up' };
    }
    return { text: `Viimeksi: ${weight}kg x ${reps}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    const exercises = WORKOUT_DATA[type].map(ex => ({
      ...ex, currentName: ex.name, sets: [{ weight: '', reps: '' }]
    }));
    setActiveWorkout({ type, exercises, startTime: new Date().toLocaleString('fi-FI') });
  };

  const updateSet = (exId, sIdx, field, val) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exId ? { ...ex, sets: ex.sets.map((s, i) => i === sIdx ? { ...s, [field]: val } : s) } : ex
      )
    }));
  };

  const addSet = (exId) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exId ? { ...ex, sets: [...ex.sets, { weight: ex.sets[ex.sets.length-1].weight, reps: '' }] } : ex
      )
    }));
  };

  const swapExercise = (id) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === id) {
          const options = [ex.name, ...ex.alternatives];
          const currentIdx = options.indexOf(ex.currentName);
          const nextIdx = (currentIdx + 1) % options.length;
          return { ...ex, currentName: options[nextIdx] };
        }
        return ex;
      })
    }));
  };

  const saveToSheets = async () => {
    if (!window.confirm("Tallennetaanko treeni?")) return;
    const payload = activeWorkout.exercises.map(ex => {
      const data = { Aikaleima: new Date().toLocaleString('fi-FI'), workoutType: activeWorkout.type, musclegroup: ex.muscle, exercisename: ex.currentName };
      ex.sets.forEach((set, i) => { if (i < 5) { data[`s${i+1}_reps`] = set.reps; data[`s${i+1}_weight`] = set.weight; }});
      return data;
    });
    try {
      const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
      if (res.ok || res.type === 'opaque') { alert("Tallennettu!"); localStorage.removeItem('active_workout'); setActiveWorkout(null); }
    } catch (e) { alert("Virhe tallennuksessa."); }
  };

  if (!activeWorkout) {
    return (
      <div className="container center center-view">
        <h1 className="glock-text">SAVVY LIFT</h1>
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
        <button className="cancel-btn" onClick={() => setActiveWorkout(null)}>✕</button>
      </header>
      <main className="workout-list">
        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps, ex);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <div><span className="muscle-tag">{ex.muscle}</span><h2 className="exercise-title">{ex.currentName}</h2></div>
                <button className="swap-action-btn" onClick={() => swapExercise(ex.id)}>SWAP</button>
              </div>
              <div className={`stats-hint ${info.status}`}>{info.text}</div>
              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i+1}.</span>
                    <input className="workout-input" type="number" placeholder="kg" value={set.weight} onChange={e => updateSet(ex.id, i, 'weight', e.target.value)} />
                    <input className="workout-input" type="number" placeholder="reps" value={set.reps} onChange={e => updateSet(ex.id, i, 'reps', e.target.value)} />
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