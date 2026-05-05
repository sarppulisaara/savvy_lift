import React, { useState, useEffect } from 'react';
import './App.css'; 

const EXERCISE_DICTIONARY = {
  'Smith Bulgarian Split Squat': ['Bulgarialainen', 'Bulgarian', 'Bulgarialainen askelkyykky', 'Smith bulgarialainen'],
  'Bulgarian Split Squat käsipainoilla': ['Bulgarialainen käsipainoilla'],
  'Jalkaprässi – vaakaprässi': ['Vaakaprässi'],
  'Jalkaprässi (pystysuora / 45°)': ['45-asteen prässi', '45 asteen prässi', 'Prässi'],
  'Vertical Row': ['Alasoutu', 'Low Row', 'Soutu'],
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
  'Askelkyykky käsipainoilla': ['Askelkyykky kp', 'Askelkyykky']
};

const WORKOUT_DATA = {
  A: [
    { id: 'a1', name: 'Smith Bulgarian Split Squat', muscle: 'Jalat', alternatives: ['Bulgarian Split Squat käsipainoilla', 'Jalkaprässi – vaakaprässi', 'Jalkaprässi (pystysuora / 45°)'], targetReps: '6-8', increment: 2.5 },
    { id: 'a2', name: 'Chest Press (laite)', muscle: 'Rinta', alternatives: ['Vinopenkki laitteessa', 'Pec Deck', 'Penkkipunnerrus käsipainoilla'], targetReps: '6-8', increment: 2.5 },
    { id: 'a3', name: 'Low Row (kaapeli)', muscle: 'Selkä', alternatives: ['Vertical Row', 'Lat Pulldown', 'Yhden käden soutu käsipainoilla'], targetReps: '6-8', increment: 2.5 },
    { id: 'a4', name: 'Reiden koukistus', muscle: 'Takareidet', alternatives: ['SJMV', 'Glute Drive'], targetReps: '10-12', increment: 2.5 },
    { id: 'a5', name: 'Vipunostot sivulle', muscle: 'Olkapäät', alternatives: ['Arnold Press', 'Pystysoutu leveällä', 'Vipunostot käsipainoilla'], targetReps: '12-15', increment: 0.5 },
    { id: 'a6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku', 'Vatsarutistus jumppapallolla', 'Istumaannousu lisäpainon kanssa'], targetReps: '15-20', increment: 2.5 }
  ],
  B: [
    { id: 'b1', name: 'Glute Drive', muscle: 'Pakarat', alternatives: ['SJMV', 'Lantionnosto käsipainoilla'], targetReps: '6-8', increment: 5.0 },
    { id: 'b2', name: 'Jalkaprässi (pystysuora / 45°)', muscle: 'Jalat', alternatives: ['Jalkaprässi – vaakaprässi', 'Smith Bulgarian Split Squat', 'Askelkyykky käsipainoilla'], targetReps: '8-10', increment: 5.0 },
    { id: 'b3', name: 'Lat Pulldown', muscle: 'Selkä', alternatives: ['Vertical Row', 'Low Row (kaapeli)', 'Yhden käden soutu käsipainoilla'], targetReps: '6-8', increment: 2.5 },
    { id: 'b4', name: 'Pystypunnerrus laitteessa', muscle: 'Olkapäät', alternatives: ['Arnold Press', 'Pystypunnerrus käsipainoilla'], targetReps: '8-10', increment: 1.0 },
    { id: 'b5', name: 'Hammer Curl', muscle: 'Hauis', alternatives: ['Hauiskääntö käsipainoilla'], targetReps: '10-12', increment: 1.0 },
    { id: 'b6', name: 'Vatsarutistus laitteessa', muscle: 'Core', alternatives: ['Lankku', 'Jalkojen nosto roikkuen', 'Vatsarutistus jumppapallolla', 'Jalkojen nostot selinmakuulla', 'Russian twist', 'Istumaannousu lisäpainon kanssa'], targetReps: '15-20', increment: 2.5 }
  ]
};

function App() {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [sheetsHistory, setSheetsHistory] = useState([]);
  
  // VARMISTA TÄMÄ URL: Käytä sitä, joka varmasti toimii!
  const API_URL = "https://script.google.com/macros/s/AKfycbxhmF1_C5q6intFIBvECvYKH6D1-u_UmYBrotic-ggWWDu99IWVYhle8ArlJJB4XhfR/exec"; 

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // Varmistetaan, että tallennetaan lista
        const rows = Array.isArray(data) ? data : (data.data || data.rows || []);
        setSheetsHistory(rows);
      })
      .catch(err => console.error("Haku epäonnistui:", err));
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
      const rawName = h.Liike || h.liike || h.exercisename || h.exerciseName || "";
      const hName = String(rawName).toLowerCase().trim();
      // Käytetään vanhaa joustavaa hakua
      return searchTerms.some(term => hName === term || hName.includes(term));
    });

    if (relevant.length === 0) {
      return { text: "Ei historiaa", status: 'normal' };
    }

    const last = relevant[relevant.length - 1];
    const w = parseNum(last.Paino || last.paino || last.s1_weight);
    const r = parseNum(last.Toistot || last.toistot || last.s1_reps);
    const maxR = parseInt(range.split('-').pop(), 10);

    if (w === 0) return { text: "Viimeksi: -", status: 'normal' };

    return r >= maxR
      ? { text: `Suositus: ${(w + obj.increment).toFixed(1).replace('.0', '')}kg (Viimeksi ${w}kg x ${r})`, status: 'level-up' }
      : { text: `Viimeksi: ${w}kg x ${r}`, status: 'normal' };
  };

  const startWorkout = (type) => {
    setActiveWorkout({
      type,
      exercises: WORKOUT_DATA[type].map(ex => {
        // TÄSSÄ SE TAIKA: Etsitään suosituspaino heti ja laitetaan se ensimmäiseen sarjaan
        const rec = getRecommendation(ex.name, ex.targetReps, ex);
        let initialWeight = "";
        
        // Jos suositus löytyy tekstistä, poimitaan se (vapaaehtoinen lisäys, jos haluat ne "haamuina")
        // Mutta oletuksena aloitetaan tyhjällä, kuten vanhassa koodissasi
        
        return {
          ...ex,
          currentName: ex.name,
          sets: [{ weight: '', reps: '' }] // Aloitetaan yhdellä tyhjällä sarjalla
        };
      })
    });
  };

  if (!activeWorkout) {
    return (
      <div className="container center-view">
        <div className="main-logo-box">
          <h1 className="glock-text savvy-logo">SAVVY LIFT</h1>
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
                <div style={{ flex: 1 }}>
                  <span className="muscle-tag">{ex.muscle}</span>
                  <h2 className="exercise-title">{ex.currentName}</h2>
                </div>
                <button className="swap-action-btn" onClick={() => {
                  const opts = [ex.name, ...ex.alternatives];
                  const next = (opts.indexOf(ex.currentName) + 1) % opts.length;
                  setActiveWorkout(p => ({
                    ...p,
                    exercises: p.exercises.map(e => e.id === ex.id ? { ...e, currentName: opts[next] } : e)
                  }));
                }}>SWAP</button>
              </div>

              <div className={`stats-hint ${info.status}`}>{info.text}</div>

              <div className="sets-container">
                {/* TÄRKEÄ KORJAUS: Käytetään mapia, ei Array.fromia */}
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row-pill">
                    <span className="set-num">{i + 1}.</span>
                    <input type="number" step="any" placeholder="kg" value={set.weight} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({
                        ...p,
                        exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, weight: v } : s) } : e)
                      }));
                    }}/>
                    <input type="number" placeholder="reps" value={set.reps} onChange={e => {
                      const v = e.target.value;
                      setActiveWorkout(p => ({
                        ...p,
                        exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, idx) => idx === i ? { ...s, reps: v } : s) } : e)
                      }));
                    }}/>
                  </div>
                ))}
              </div>

              <button className="add-set-pill" onClick={() => {
                setActiveWorkout(p => ({
                  ...p,
                  exercises: p.exercises.map(e => e.id === ex.id ? { ...e, sets: [...e.sets, { weight: e.sets[e.sets.length - 1].weight, reps: '' }] } : e)
                }));
              }}>+ LISÄÄ SARJA</button>
            </div>
          );
        })}
      </main>

      <button className="main-save-btn" onClick={async () => {
        if (!window.confirm("Tallennetaanko?")) return;
        const payload = activeWorkout.exercises.map(ex => {
          const d = {
            Aikaleima: new Date().toLocaleDateString('fi-FI') + " " + new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }),
            workoutType: activeWorkout.type,
            musclegroup: ex.muscle,
            exercisename: ex.currentName,
          };
          ex.sets.forEach((s, i) => {
            if (i < 5) {
              d[`s${i + 1}_reps`] = s.reps ? "'" + s.reps : "";
              d[`s${i + 1}_weight`] = s.weight ? "'" + s.weight : "";
            }
          });
          return d;
        });

        try {
          await fetch(API_URL, { method: "POST", mode: 'no-cors', body: JSON.stringify(payload) });
          alert("Tallennettu!");
          setActiveWorkout(null);
        } catch (e) { alert("Virhe tallennuksessa."); }
      }}>TALLENNA TREENI</button>
    </div>
  );
}

export default App;