import React, { useState, useEffect } from 'react';
import './App.css';

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Bulgarialainen askelkyykky', alternatives: ['Askelkyykky kp', 'Jalkaprässi yhdellä jalalla'], reps: '8-10' },
    { id: 'a2', name: 'Arnold press', alternatives: ['Pystypunnerrus kp', 'Pystypunnerrus tangolla'], reps: '10-12' },
    { id: 'a3', name: 'Ylätalja leveä ote', alternatives: ['Leuanveto avustettuna', 'Kulmasoutu kp'], reps: '10-12' },
    { id: 'a4', name: 'Vipunostot sivulle kp', alternatives: ['Vipunostot taljassa', 'Pystysoutu'], reps: '12-15' },
    { id: 'a5', name: 'Reiden koukistus istuen', alternatives: ['Makaava reiden koukistus', 'SJMV kp'], reps: '12-15' }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', alternatives: ['Lantionnosto tangolla', 'Kyykky leveä ote'], reps: '8-10' },
    { id: 'b2', name: 'Penkkipunnerrus kp', alternatives: ['Ristikkäistalja', 'Etunojapunnerrus'], reps: '10-12' },
    { id: 'b3', name: 'Alasoutu leveä ote', alternatives: ['Yhden käden soutu kp', 'Kulmasoutu tangolla'], reps: '10-12' },
    { id: 'b4', name: 'Face pull', alternatives: ['Takaolkapäät laitteessa', 'Vipunostot taakse'], reps: '15-20' },
    { id: 'b5', name: 'Reiden ojennus', alternatives: ['Pakarapotku taljassa', 'Kyykky kp'], reps: '12-15' }
  ]
};

function App() {
  const [currentTab, setCurrentTab] = useState('A');
  const [exercises, setExercises] = useState(WORKOUT_DATA['A'].map(ex => ({...ex, currentName: ex.name})));
  const [sheetsHistory, setSheetsHistory] = useState([]);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbxK9_ZncVDu9_R4FqzxbFv3S2Bpc9ot9q-abq5yCfF2UxajM-r3cTT9RuQjJLFbK7dY/exec")
      .then(res => res.json())
      .then(data => setSheetsHistory(data))
      .catch(err => console.error("History error:", err));
  }, []);

  const getHistoryForExercise = (exerciseName, targetReps) => {
    const record = [...sheetsHistory].reverse().find(h => h.liike.toLowerCase().trim() === exerciseName.toLowerCase().trim());
    if (!record) return { text: "Ei historiaa", status: 'normal' };
    const targetNum = parseInt(targetReps.split('-').pop());
    return record.toistot >= targetNum 
      ? { text: `Uusi suositus: ${record.paino}kg x ${record.toistot}`, status: 'level-up' }
      : { text: `Viimeksi: ${record.paino}kg x ${record.toistot}`, status: 'normal' };
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
    setExercises(WORKOUT_DATA[tab].map(ex => ({...ex, currentName: ex.name})));
  };

  const swapExercise = (id) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        const options = [ex.name, ...ex.alternatives];
        const currentIdx = options.indexOf(ex.currentName);
        const nextIdx = (currentIdx + 1) % options.length;
        return { ...ex, currentName: options[nextIdx] };
      }
      return ex;
    }));
  };

  return (
    <div className="container">
      <header className="header-card">
        <h1 className="glock-text">SAVVY LIFT</h1>
      </header>

      <nav className="tab-bar">
  <button className={currentTab === 'A' ? 'active' : ''} onClick={() => switchTab('A')}>
    TREENI A
  </button>
  <button className={currentTab === 'B' ? 'active' : ''} onClick={() => switchTab('B')}>
    TREENI B
  </button>
</nav>

      <main className="workout-list">
        {exercises.map((ex) => {
          const historyInfo = getHistoryForExercise(ex.currentName, ex.reps);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-info">
                <h2 className="exercise-title">{ex.currentName}</h2>
                <button className="swap-icon-btn" onClick={() => swapExercise(ex.id)}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                  </svg>
                </button>
              </div>
              <div className={`stats-hint ${historyInfo.status}`}>
                {historyInfo.text} | Tavoite: {ex.reps}
              </div>
              <div className="input-row">
                <div className="input-wrap">
                  <input 
                    type="number" 
                    step="0" 
                    inputMode="decimal" 
                    placeholder="0.0" 
                    onChange={e => ex.inputWeight = e.target.value}
                  />
                </div>
                <div className="input-wrap">
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    placeholder="0" 
                    onChange={e => ex.inputReps = e.target.value}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <button className="main-save-btn" onClick={() => alert("Tallennetaan...")}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;