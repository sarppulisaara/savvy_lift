import React, { useState, useEffect } from 'react';
import './App.css';

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Bulgarialainen askelkyykky', reps: '8-10' },
    { id: 'a2', name: 'Arnold press', reps: '10-12' }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', reps: '8-10' },
    { id: 'b2', name: 'Penkkipunnerrus kp', reps: '10-12' }
  ]
};

function App() {
  const [activeWorkout, setActiveWorkout] = useState(() => {
    // [cite: 14, 23] Tallennus ja automaattinen sessiohallinta
    const saved = localStorage.getItem('active_workout');
    return saved ? JSON.parse(saved) : null;
  });

  // Tallenna heti kun tila muuttuu
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('active_workout', JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  const startWorkout = (type) => {
    const initialExercises = WORKOUT_DATA[type].map(ex => ({
      ...ex,
      currentName: ex.name,
      sets: [{ weight: '', reps: '' }] // [cite: 21, 28] Sarjapillerit ja data-logiikka
    }));
    setActiveWorkout({ type, exercises: initialExercises });
  };

  const addSet = (exId) => {
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exId ? { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] } : ex
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

  const clearWorkout = () => {
    if(window.confirm("Hylätäänkö treeni?")) {
      localStorage.removeItem('active_workout');
      setActiveWorkout(null);
    }
  };

  if (!activeWorkout) {
    return (
      <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
        <h1 className="glock-text">SAVVY LIFT</h1>
        <button className="main-save-btn" onClick={() => startWorkout('A')}>ALOITA TREENI A</button>
        <button className="main-save-btn" style={{marginTop: '1rem'}} onClick={() => startWorkout('B')}>ALOITA TREENI B</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className="glock-text">TREENI {activeWorkout.type}</h1>
        <button onClick={clearWorkout} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem'}}>✕</button>
      </header>

      <main className="workout-list">
        {activeWorkout.exercises.map((ex) => (
          <div key={ex.id} className="exercise-card">
            <h2 className="exercise-title">{ex.currentName}</h2>
            {ex.sets.map((set, i) => (
              <div key={i} style={{display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center'}}>
                <span style={{width: '20px'}}>{i+1}.</span>
                <input 
                  type="number" 
                  placeholder="kg" 
                  value={set.weight}
                  onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                  style={{flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc'}}
                />
                <input 
                  type="number" 
                  placeholder="reps" 
                  value={set.reps}
                  onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                  style={{flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc'}}
                />
              </div>
            ))}
            <button onClick={() => addSet(ex.id)} className="add-set-btn">+ LISÄÄ SARJA</button>
          </div>
        ))}
      </main>

      <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', fontSize: '10px'}}>
        <strong>Debug (LocalStorage):</strong> {activeWorkout ? "Tallennettu muistiin" : "Tyhjä"}
      </div>

      <button className="main-save-btn" onClick={() => alert("Tähän myöhemmin Sheets-tallennus")}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;