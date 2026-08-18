import React, { useState, useEffect } from 'react';
import '../App.css';

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky', 'Smith bulgarialainen'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Prässi'],
  'Vertical Row': ['Vertical row'],
  'Low Row (kaapeli)': ['Low Row', 'Kaapelisoutu', 'Soutu kaapelissa'],
  'Chest Press (laite)': ['Penkkipunnerrus', 'Chest Press'],
  'Vinopenkki laitteessa': ['Vinopenkki', 'Incline press', 'Incline'],
  'Pec Deck': ['Pecdeck', 'Rintapekki', 'Rintapec'],
  'Arnold Press': ['Arnold'],
  'Pystypunnerrus laitteessa': ['Pystypunnerrus', 'Shoulder press'],
  'Pystypunnerrus käsipainoilla': ['Pystypunnerrus kp'],
  'Vipunostot sivulle': ['Sivuvipu', 'Vipunostot', 'Lateral raise'],
  'Vipunostot käsipainoilla': ['Vipunostot kp', 'Sivuvipu kp'],
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
  'Lantionnosto käsipainoilla': ['Hip thrust käsipainoilla'],
  'Reiden ojennus': ['Ojennus', 'Leg extension'],
  'Reiden koukistus': ['Koukistus', 'Leg curl', 'Reiden koukistus istuen'],
  'Lat Pulldown': ['Ylätalja', 'Lat pulldown'],
  'SJMV': ['Suorin jaloin maastaveto', 'Romanian deadlift', 'RDL', 'SJMV kp'],
  'Penkkipunnerrus käsipainoilla': ['Penkkipunnerrus kp', 'Käsipainopenkki', 'DB penkki'],
  'Yhden käden soutu käsipainoilla': ['Yhden käden soutu kp', 'Käsipainosoutu'],
  'Askelkyykky käsipainoilla': ['Askelkyykky kp', 'Askelkyykky'],
  'Jalkojen nosto roikkuen': ['Hanging leg raise'],
  'Vatsarutistus jumppapallolla': ['Swiss ball crunch', 'Crunch jumppapallolla'],
  'Jalkojen nostot selinmakuulla': ['Leg raise', 'Leg raises'],
  'Russian twist': ['Russian twists'],
  'Istumaannousu lisäpainon kanssa': ['Weighted sit up', 'Sit up lisäpainolla'],
  'Face Pull': ['Face pull', 'Facepull', 'Kasvoveto taljassa']
};

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Smith Bulgarian Split Squat', muscle: 'Jalat', reps: '6-8', increment: 2.5 },
    { id: 'a2', name: 'Chest Press (laite)', muscle: 'Rinta', reps: '6-8', increment: 2.5 },
    { id: 'a3', name: 'Low Row (kaapeli)', muscle: 'Selkä', reps: '6-8', increment: 2.5 },
    { id: 'a4', name: 'Reiden koukistus', muscle: 'Takareidet', reps: '10-12', increment: 2.5 },
    { id: 'a5', name: 'Vipunostot sivulle', muscle: 'Olkapäät', reps: '12-15', increment: 0.5 },
    { id: 'a6', name: 'Vatsarutistus laitteessa', muscle: 'Core', reps: '15-20', increment: 2.5 }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', reps: '6-8', increment: 5.0 },
    { id: 'b2', name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Jalat', reps: '8-10', increment: 5.0 },
    { id: 'b3', name: 'Lat Pulldown', muscle: 'Selkä', reps: '6-8', increment: 2.5 },
    { id: 'b4', name: 'Pystypunnerrus laitteessa', muscle: 'Olkapäät', reps: '8-10', increment: 1.0 },
    { id: 'b5', name: 'Hammer Curl', muscle: 'Hauis', reps: '10-12', increment: 1.0 },
    { id: 'b6', name: 'Vatsarutistus laitteessa', muscle: 'Core', reps: '15-20', increment: 2.5 }
  ],
  C: [
    { id: 'c1', name: 'SJMV', muscle: 'Takaketju', reps: '8-10', increment: 5.0 },
    { id: 'c2', name: 'Vinopenkki laitteessa', muscle: 'Rinta', reps: '8-10', increment: 2.5 },
    { id: 'c3', name: 'Vertical Row', muscle: 'Selkä', reps: '8-10', increment: 2.5 },
    { id: 'c4', name: 'Face Pull', muscle: 'Takaolkapää', reps: '12-15', increment: 1.0 },
    { id: 'c5', name: 'Push Down', muscle: 'Ojentajat', reps: '12-15', increment: 2.5 },
    { id: 'c6', name: 'Jalkojen nostot selinmakuulla', muscle: 'Core', reps: '10-15', increment: 1.0 }
  ]
};

function normalizeName(value) { return String(value || '').toLowerCase().trim(); }
function parseNum(value) {
  if (!value) return 0;
  const n = parseFloat(String(value).replace("'", "").replace(',', '.').trim());
  return isNaN(n) ? 0 : n;
}

function getExerciseName(row) { return row.Liike || row.liike || row.exercisename || row.exerciseName || row.ExerciseName || ''; }
function getWeight(row) { return parseNum(row.Paino || row.paino || row.s1_weight || row.Weight); }
function getReps(row) { return parseNum(row.Toistot || row.toistot || row.s1_reps || row.Reps); }

function History() {
  const [currentTab, setCurrentTab] = useState('A');
  const [exercises, setExercises] = useState(WORKOUT_DATA.A.map(ex => ({ ...ex, currentName: ex.name })));
  const [sheetsHistory, setSheetsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0hFtXKOVPLViTVm9vJVFxgauqNGaJasnyybPdYO8Wo0B8rNStPR-TbMPBDh7M7xR8/exec";

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => { setSheetsHistory(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const getHistoryForExercise = (exerciseName, targetReps, increment) => {
    const aliases = EXERCISE_DICTIONARY[exerciseName] || [];
    const searchTerms = [exerciseName, ...aliases].map(normalizeName);
    const record = [...sheetsHistory].reverse().find(row => {
      const rowName = normalizeName(getExerciseName(row));
      return searchTerms.some(term => rowName === term);
    });

    if (!record) return { text: "Ei historiaa, syötä aloituspaino", status: 'normal' };
    const weight = getWeight(record);
    const reps = getReps(record);
    const targetNum = parseInt(String(targetReps).split('-').pop(), 10);
    if (weight === 0) return { text: "Viimeksi: -", status: 'normal' };
    return reps >= targetNum
      ? { text: `Suositus: ${(weight + increment).toFixed(1).replace('.0', '')}kg (Viimeksi ${weight}kg x ${reps})`, status: 'level-up' }
      : { text: `Viimeksi: ${weight}kg x ${reps}`, status: 'normal' };
  };

  return (
    <div className="container">
      <div className="header-card"><h1>SAVVY LIFT</h1></div>
      <div className="tab-bar">
        {['A', 'B', 'C'].map(tab => (
          <button key={tab} className={currentTab === tab ? 'active' : ''} onClick={() => { setCurrentTab(tab); setExercises(WORKOUT_DATA[tab].map(ex => ({ ...ex, currentName: ex.name }))); }}>OHJELMA {tab}</button>
        ))}
      </div>
      {loading ? <div className="exercise-card"><h2>Ladataan historiaa...</h2></div> : (
        <div className="bento-grid">
          {exercises.map((ex) => {
            const historyInfo = getHistoryForExercise(ex.currentName, ex.reps, ex.increment);
            return (
              <div key={ex.id} className="exercise-card">
                <div className="exercise-info">
                  <div><span className="muscle-tag">{ex.muscle}</span><h2>{ex.currentName}</h2></div>
                </div>
                <div className={`stats-hint ${historyInfo.status}`}>{historyInfo.text} | Tavoite: {ex.reps}</div>
              </div>
            );
          })}
        </div>
      )}
      <button className="main-save-btn" onClick={() => alert("Historia on vain katselua varten.")}>HISTORIA</button>
    </div>
  );
}
export default History;