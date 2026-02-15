import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://script.google.com/macros/s/AKfycbx1uNomu1DL6bY8r19y8O487EpDVFwOe-nbl6G0-F2XYrPxx-zR-0BwU32qDtHU1vhI/exec";

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Bulgarialainen askelkyykky', muscle: 'Etureidet', alternatives: ['Jalkaprässi', 'Hack-kyykky'], targetReps: '8-10' },
    { id: 'a2', name: 'Arnold Press', muscle: 'Etolkapää', alternatives: ['Pystypunnerruslaite', 'Punnerrus kp'], targetReps: '10-12' },
    { id: 'a3', name: 'Ylätalja leveä ote', muscle: 'Yläselkä', alternatives: ['Leuanvetolaite', 'Ylätalja kapea'], targetReps: '10-12' },
    { id: 'a4', name: 'Vipunostot sivulle kp', muscle: 'Sivuolkapää', alternatives: ['Vipunostot laitteessa', 'Vipunostot taljassa'], targetReps: '12-15' },
    { id: 'a5', name: 'Reiden koukistus istuen', muscle: 'Takareidet', alternatives: ['Makaava koukistuslaite', 'SJMV kp'], targetReps: '12-15' }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', alternatives: ['Lantionnostolaite', 'Kyykky leveä ote'], targetReps: '8-10' },
    { id: 'b2', name: 'Penkkipunnerrus kp', muscle: 'Rinta', alternatives: ['Rintaprässilaite', 'Vinopenkkilaite'], targetReps: '10-12' },
    { id: 'b3', name: 'Alasoutu leveä ote', muscle: 'Keskiselkä', alternatives: ['Soutulaite tuettu', 'Kulmasoutu tangolla'], targetReps: '10-12' },
    { id: 'b4', name: 'Face pull', muscle: 'Takaolkapää', alternatives: ['Takaolkapäälaite', 'Vipunostot taakse'], targetReps: '15-20' },
    { id: 'b5', name: 'Reiden ojennus', muscle: 'Etureidet', alternatives: ['Jalkaprässi', 'Kyykky kp'], targetReps: '12-15' }
  ]
};

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    const saved = localStorage.getItem('active_workout');
    return saved ? JSON.parse(saved) : null;
  });
  const [sheetsHistory, setSheetsHistory] = useState([]);

  // Lataa historia käynnistyksessä
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSheetsHistory(data))
      .catch(err => console.error("Historiavirhe:", err));
  }, []);

  // Automaattinen välitallennus localStorageen
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('active_workout', JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  // Älykäs suosituslogiikka (etsii parhaan sarjan wide-format datasta)
  const getRecommendation = (name, target) => {
    const last = [...sheetsHistory].reverse().find(h => 
      h.liike?.toLowerCase().trim() === name.toLowerCase().trim() || 
      h.exercisename?.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (!last) return { text: "Ei historiaa", status: 'normal' };
    
    let maxWeightDone = 0;
    let maxRepsDone = 0;
    const targetMax = parseInt(target.split('-').pop());

    // Tarkistetaan sarakkeet s1-s5 (sekä vanhat 'paino'/'toistot' jos niitä on)
    for (let i = 1; i <= 5; i++) {
      const r = last[`s${i}_reps`];
      const w = last[`s${i}_weight`];
      if (r && w && Number(w) >= maxWeightDone) {
        maxWeightDone = Number(w);
        maxRepsDone = Number(r);
      }
    }
    
    // Fallback vanhalle datamuodolle
    if (maxWeightDone === 0) {
      maxWeightDone = Number(last.paino || 0);
      maxRepsDone = Number(last.toistot || 0);
    }

    return maxRepsDone >= targetMax 
      ? { text: `Suositus: ${maxWeightDone + 2.5}kg (Viimeksi ${maxWeightDone}kg x ${maxRepsDone})`, status: 'level-up' }
      : { text: `Viimeksi: ${maxWeightDone}kg x ${maxRepsDone}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    const exercises = WORKOUT_DATA[type].map(ex => ({
      ...ex,
      currentName: ex.name,
      sets: [{ weight: '', reps: '' }]
    }));
    setActiveWorkout({ type, exercises, startTime: new Date().toLocaleString('fi-FI') });
  };

  const addSet = (exId) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exId ? { 
          ...ex, 
          sets: [...ex.sets, { weight: ex.sets[ex.sets.length-1].weight, reps: '' }] 
        } : ex
      )
    }));
  };

  const updateSet = (exId, sIdx, field, val) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exId ? { 
          ...ex, 
          sets: ex.sets.map((s, i) => i === sIdx ? { ...s, [field]: val } : s) 
        } : ex
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
    if (!window.confirm("Tallennetaanko treeni Sheetsiin?")) return;

    // Muunnetaan data Sheetsin wide-format muotoon (yksi rivi per liike)
    const payload = activeWorkout.exercises.map(ex => {
      const data = {
        Aikaleima: new Date().toLocaleString('fi-FI'),
        workoutType: activeWorkout.type,
        musclegroup: ex.muscle,
        exercisename: ex.currentName,
        notes: ""
      };
      
      ex.sets.forEach((set, i) => {
        if (i < 5) { // Sheets-sarakkeet s1-s5
          data[`s${i+1}_reps`] = set.reps;
          data[`s${i+1}_weight`] = set.weight;
        }
      });
      return data;
    });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      if (response.ok || response.type === 'opaque') {
        alert("Treeni tallennettu!");
        localStorage.removeItem('active_workout');
        setActiveWorkout(null);
      }
    } catch (e) {
      alert("Tallennusvirhe. Tarkista yhteys.");
    }
  };

  if (!activeWorkout) {
    return (
      <div className="container center">
        <h1 className="glock-text">SAVVY LIFT</h1>
        <div className="start-actions">
          <button className="main-save-btn" onClick={() => startWorkout('A')}>TREENI A</button>
          <button className="main-save-btn" onClick={() => startWorkout('B')} style={{marginTop: '1rem'}}>TREENI B</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-card sticky-header">
        <h1 className="glock-text">{activeWorkout.type}-TREENI</h1>
        <button className="cancel-btn" onClick={() => { if(confirm("Hylätäänkö treeni?")) { localStorage.removeItem('active_workout'); setActiveWorkout(null); }}}>✕</button>
      </header>

      <main className="workout-list">
        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <h2 className="exercise-title">{ex.currentName}</h2>
                <button className="swap-icon-btn" onClick={() => swapExercise(ex.id)}>🔄</button>
              </div>
              <div className={`stats-hint ${info.status}`}>{info.text} | Tavoite: {ex.targetReps}</div>
              
              {ex.sets.map((set, i) => (
                <div key={i} className="set-row-pill">
                  <span className="set-num">{i+1}.</span>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    placeholder="kg" 
                    value={set.weight} 
                    onChange={e => updateSet(ex.id, i, 'weight', e.target.value)} 
                  />
                  <input 
                    type="number" 
                    inputMode="numeric"
                    placeholder="reps" 
                    value={set.reps} 
                    onChange={e => updateSet(ex.id, i, 'reps', e.target.value)} 
                  />
                </div>
              ))}
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