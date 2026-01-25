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
  const [loading, setLoading] = useState(true);

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxK9_ZncVDu9_R4FqzxbFv3S2Bpc9ot9q-abq5yCfF2UxajM-r3cTT9RuQjJLFbK7dY/exec";

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        setSheetsHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Virhe historian haussa:", err);
        setLoading(false);
      });
  }, []);

  const getHistoryForExercise = (exerciseName, targetReps) => {
    const record = [...sheetsHistory].reverse().find(h => h.liike.toLowerCase().trim() === exerciseName.toLowerCase().trim());
    if (!record) return { text: "Ei historiaa", status: 'normal' };
    const targetNum = parseInt(targetReps.split('-').pop());
    const isTargetMet = record.toistot >= targetNum;
    return isTargetMet 
      ? { text: `Viimeksi: ${record.paino}kg x ${record.toistot} (Tavoite saavutettu)`, status: 'level-up' }
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
      <div className="header-card">
        <h1 className="glock-text">SAVVY LIFT</h1>
      </div>

      <div className="tab-bar">
        <button className={currentTab === 'A' ? 'active' : ''} onClick={() => switchTab('A')}>OHJELMA A</button>
        <button className={currentTab === 'B' ? 'active' : ''} onClick={() => switchTab('B')}>OHJELMA B</button>
      </div>

      <div className="bento-grid">
        {exercises.map((ex) => {
          const historyInfo = getHistoryForExercise(ex.currentName, ex.reps);
          return (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-info">
                <h2 className="akizidenz-text">{ex.currentName}</h2>
                <button className="swap-pill" onClick={() => swapExercise(ex.id)}>VAIHDA</button>
              </div>
              
              <div className={`stats-hint ${historyInfo.status}`}>
                {historyInfo.text} | Tavoite: {ex.reps}
              </div>

              <div className="input-row">
                <input type="number" placeholder="kg" onChange={e => ex.inputWeight = e.target.value} />
                <input type="number" placeholder="reps" onChange={e => ex.inputReps = e.target.value} />
              </div>
            </div>
          );
        })}
      </div>

      <button className="main-save-btn" onClick={() => alert("Tallennetaan...")}>
        TALLENNA TREENI
      </button>
    </div>
  );
}

export default App;