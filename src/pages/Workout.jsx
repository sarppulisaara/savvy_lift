import { useEffect, useMemo, useState } from "react";
import { workoutTemplates } from "../data/template";
import { ExerciseCard } from "../components/ExerciseCard";
import { getOrCreateTodaySession } from "../storage/store";

const API_URL = "https://script.google.com/macros/s/AKfycbzuHP8Yn-MJz7TuMeqK1O8XeCYSzJZ3jlIfxx5d0F0EuWxp-THxOhAK-kTHsqcu8TGQ/exec";

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
  'Istumaannousu lisäpainon kanssa': ['Weighted sit up', 'Sit up lisäpainolla']
};

async function sendWorkoutToGoogle(data) {
  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (e) { console.error(e); }
}

function parseNum(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace("'", "").replace(",", ".").trim());
  return isNaN(n) ? 0 : n;
}

function getRecommendation(name, range, increment, sheetsHistory) {
  const aliases = EXERCISE_DICTIONARY[name] || [];
  const searchTerms = [name, ...aliases].map((n) => n.toLowerCase().trim());
  const relevant = sheetsHistory.filter((h) => {
    const rawName = h.Liike || h.liike || h.exerciseName || h.exercisename || h.Harjoitus || "";
    const hName = String(rawName).toLowerCase().trim();
    return searchTerms.some((term) => hName === term || hName.includes(term));
  });
  if (relevant.length === 0) return { text: "Ei historiaa", status: "normal" };
  const last = relevant[relevant.length - 1];
  const w = parseNum(last.Paino || last.paino || last.s1_weight || last.Weight);
  const r = parseNum(last.Toistot || last.toistot || last.s1_reps || last.Reps);
  const maxR = parseInt(String(range).split("-").pop(), 10);
  if (w === 0) return { text: "Viimeksi: -", status: "normal" };
  return r >= maxR
    ? { text: `Suositus: ${(w + increment).toFixed(1).replace(".0", "")}kg (Viimeksi ${w}kg x ${r})`, status: "level-up" }
    : { text: `Viimeksi: ${w}kg x ${r}`, status: "normal" };
}

export default function Workout() {
  const [mode, setMode] = useState("A");
  const [loading, setLoading] = useState(false);
  const [sheetsHistory, setSheetsHistory] = useState([]);
  const template = useMemo(() => workoutTemplates[mode], [mode]);
  const [session, setSession] = useState(() => getOrCreateTodaySession(workoutTemplates.A, "A"));
  const [editing, setEditing] = useState(null);

  useEffect(() => { setSession(getOrCreateTodaySession(template, mode)); }, [mode, template]);
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setSheetsHistory(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    }
    fetchHistory();
  }, []);

  function openEdit(exerciseId, setIndex) { setEditing({ exerciseId, setIndex }); }
  function saveSet(weight, repsDone) {
    setSession((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const ex = copy.exercises.find((e) => e.id === editing.exerciseId);
      if (ex) ex.sets[editing.setIndex] = { weight, repsDone, done: repsDone != null };
      return copy;
    });
    setEditing(null);
  }

  function swapExercise(exerciseId) {
    setSession((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const ex = copy.exercises.find((e) => e.id === exerciseId);
      if (!ex) return prev;
      const options = [ex.baseName, ...(ex.alternatives || [])];
      const currentIndex = options.indexOf(ex.currentName || ex.name);
      ex.currentName = options[(currentIndex + 1) % options.length];
      return copy;
    });
  }

  async function submitAllWorkouts() {
    const activeExercises = session.exercises.filter((ex) => ex.sets.some((s) => s.repsDone > 0));
    if (activeExercises.length === 0) { alert("Kirjaa vähintään yksi sarja!"); return; }
    setLoading(true);
    try {
      for (const ex of activeExercises) {
        await sendWorkoutToGoogle({
          workoutType: mode,
          musclegroup: ex.muscleGroup || "Savvy Lift",
          exercisename: ex.currentName || ex.name,
          s1_reps: ex.sets[0]?.repsDone ? "'" + ex.sets[0].repsDone : "",
          s1_weight: ex.sets[0]?.weight ? "'" + ex.sets[0].weight : "",
          s2_reps: ex.sets[1]?.repsDone ? "'" + ex.sets[1].repsDone : "",
          s2_weight: ex.sets[1]?.weight ? "'" + ex.sets[1].weight : "",
          s3_reps: ex.sets[2]?.repsDone ? "'" + ex.sets[2].repsDone : "",
          s3_weight: ex.sets[2]?.weight ? "'" + ex.sets[2].weight : "",
          s4_reps: ex.sets[3]?.repsDone ? "'" + ex.sets[3].repsDone : "",
          s4_weight: ex.sets[3]?.weight ? "'" + ex.sets[3].weight : "",
          s5_reps: ex.sets[4]?.repsDone ? "'" + ex.sets[4].repsDone : "",
          s5_weight: ex.sets[4]?.weight ? "'" + ex.sets[4].weight : ""
        });
      }
      setLoading(false);
      alert("Valmis! Treeni tallennettu.");
      window.location.reload();
    } catch (err) { setLoading(false); alert("Virhe!"); }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h1 style={{ margin: 0, fontWeight: 900 }}>{template.title}</h1>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {['A', 'B', 'C'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={mode === m ? chipActive : chip}>Treeni {m}</button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        {session.exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} sets={ex.sets} onEditSet={openEdit} onSwapExercise={swapExercise} 
            recommendation={getRecommendation(ex.currentName || ex.name, ex.targetReps, ex.increment || 2.5, sheetsHistory)} />
        ))}
      </div>
      <button onClick={submitAllWorkouts} disabled={loading} style={{...submitBtnStyle, background: loading ? "#9ca3af" : "#22c55e"}}>{loading ? "Tallennetaan..." : "Lähetä ja tallenna"}</button>
    </div>
  );
}

const chip = { padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "#eee", fontWeight: 800, cursor: "pointer" };
const chipActive = { ...chip, background: "#111", color: "#fff" };
const submitBtnStyle = { width: "100%", marginTop: 30, padding: 18, color: "#fff", borderRadius: 16, border: "none", fontWeight: 900, fontSize: 16 };