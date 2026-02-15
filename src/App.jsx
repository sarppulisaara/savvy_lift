import React, { useState, useEffect } from 'react';
import './App.css';

// PÄIVITETTY LINKKI
const API_URL = "https://script.google.com/macros/s/AKfycbx6rEF4pPdmxj1RTCKIuhGlx4rPdDFPkVivZo72-CCIp0B5m_sfexP7urP5uRKxM4HM/exec";

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
      .then(data => {
        console.log("Ladattu historia:", data);
        setSheetsHistory(data);
      })
      .catch(err => console.error("Historiavirhe:", err));
  }, []);

  // Automaattinen välitallennus
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('active_workout', JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  // Älykäs suosituslogiikka
  const getRecommendation = (name, target) => {
    // Etsitään historiasta joko exercisename tai liike (vanha data)
    const last = [...sheetsHistory].reverse().find(h => 
      (h.liike && h.liike.toLowerCase().trim() === name.toLowerCase().trim()) || 
      (h.exercisename && h.exercisename.toLowerCase().trim() === name.toLowerCase().trim())
    );
    
    if (!last) return { text: "Ei historiaa", status: 'normal' };
    
    let maxWeightDone = 0;
    let maxRepsDone = 0;
    const targetMax = parseInt(target.split('-').pop());

    // Tarkistetaan uuden datan s1-s5 (jos löytyy)
    for (let i = 1; i <= 5; i++) {
      const r = last[`s${i}_reps`];
      const w = last[`s${i}_weight`];
      if (r && w && Number(w) >= maxWeightDone) {
        maxWeightDone = Number(w);
        maxRepsDone = Number(r);
      }
    }
    
    // Fallback vanhalle datalle (Koonti-välilehti)
    if (maxWeightDone === 0) {
      maxWeightDone = Number(last.paino || last.s1_weight || 0);
      maxRepsDone = Number(last.toistot || last.s1_reps || 0);
    }

    if (maxWeightDone === 0) return { text: "Viimeksi: -", status: 'normal' };

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

    const payload = activeWorkout.exercises.map(ex => {
      const data = {
        Aikaleima: new Date().toLocaleString('fi-FI'),
        workoutType: activeWorkout.type,
        musclegroup: ex.muscle,
        exercisename: ex.currentName,
        notes: ""
      };
      
      ex.sets.forEach((set, i) => {
        if (i < 5) {
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

  // --- ETUSIVUN NÄKYMÄ ---
  if (!activeWorkout) {
    return (
      <div className="container center center-view">
        <div className="header-card main-logo-box">
          <h1 className="glock-text">SAVVY LIFT</h1>
        </div>
        
        <div className="start-actions">
          <button className="workout-select-btn" onClick={() => startWorkout('A')}>
            TREENI A
          </button>
          <button className="workout-select-btn bento-blue-btn" onClick={() => startWorkout('B')}>
            TREENI B
          </button>
        </div>
      </div>
    );
  }

  // --- TREENINÄKYMÄ ---
  return (
    <div className="container">
      <header className="header-card no-sticky">
        <h1 className="glock-text">{activeWorkout.type}-TREENI</h1>
        <button className="cancel-btn" onClick={() => { if(confirm("Hylätäänkö treeni?")) { localStorage.removeItem('active_workout'); setActiveWorkout(null); }}}>✕</button>
      </header>

      <main className="workout-list">
        {activeWorkout.exercises.map(ex => {
          const info = getRecommendation(ex.currentName, ex.targetReps);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-header">
                <div style={{flex: 1}}>
                  <span className="muscle-tag">{ex.muscle}</span>
                  <h2 className="exercise-title">{ex.currentName}</h2>
                </div>
                <button className="swap-action-btn" onClick={() => swapExercise(ex.id)}>
                   SWAP
                </button>
              </div>
              
              <div className={`stats-hint ${info.status}`}>{info.text}</div>
              
              <div className="sets-container">
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i+1}.</span>
                    <input 
                      className="workout-input"
                      type="number" 
                      inputMode="decimal"
                      placeholder="kg" 
                      value={set.weight} 
                      onChange={e => updateSet(ex.id, i, 'weight', e.target.value)} 
                    />
                    <input 
                      className="workout-input"
                      type="number" 
                      inputMode="numeric"
                      placeholder="reps" 
                      value={set.reps} 
                      onChange={e => updateSet(ex.id, i, 'reps', e.target.value)} 
                    />
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