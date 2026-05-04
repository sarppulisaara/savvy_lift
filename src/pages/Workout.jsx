import { useEffect, useMemo, useState } from "react";
import { workoutTemplates } from "../data/template";
import { ExerciseCard } from "../components/ExerciseCard";
import { getOrCreateTodaySession } from "../storage/store";

const API_URL = "https://script.google.com/macros/s/AKfycbxK9_ZncVDu9_R4FqzxbFv3S2Bpc9ot9q-abq5yCfF2UxajM-r3cTT9RuQjJLFbK7dY/exec";

const EXERCISE_DICTIONARY ={
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
    console.log("✅ Lähetetty:", data.exerciseName);
  } catch (e) {
    console.error("❌ Virhe lähetyksessä:", e);
  }
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
    const rawName =
      h.Liike ||
      h.liike ||
      h.exerciseName ||
      h.exercisename ||
      h.Harjoitus ||
      "";

    const hName = String(rawName).toLowerCase().trim();

    return searchTerms.some(
      (term) => hName === term || hName.includes(term)
    );
  });

  if (relevant.length === 0) {
    return { text: "Ei historiaa, syötä aloituspaino", status: "normal" };
  }

  const last = relevant[relevant.length - 1];

  const w = parseNum(last.Paino || last.paino || last.s1_weight || last.Weight);
  const r = parseNum(last.Toistot || last.toistot || last.s1_reps || last.Reps);

  const maxR = parseInt(String(range).split("-").pop(), 10);

  if (w === 0) {
    return { text: "Viimeksi: -", status: "normal" };
  }

  return r >= maxR
    ? {
        text: `Suositus: ${(w + increment).toFixed(1).replace(".0", "")}kg (Viimeksi ${w}kg x ${r})`,
        status: "level-up"
      }
    : {
        text: `Viimeksi: ${w}kg x ${r}`,
        status: "normal"
      };
}

export default function Workout() {
  const [mode, setMode] = useState("A");
  const [loading, setLoading] = useState(false);
  const [sheetsHistory, setSheetsHistory] = useState([]);
  const template = useMemo(() => workoutTemplates[mode], [mode]);
  const [session, setSession] = useState(() => getOrCreateTodaySession(workoutTemplates.A, "A"));
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setSession(getOrCreateTodaySession(template, mode));
  }, [mode, template]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setSheetsHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Virhe historian haussa:", e);
      }
    }

    fetchHistory();
  }, []);

  function openEdit(exerciseId, setIndex) {
    setEditing({ exerciseId, setIndex });
  }

  function saveSet(weight, repsDone) {
    setSession((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const ex = copy.exercises.find((e) => e.id === editing.exerciseId);
      if (ex) {
        ex.sets[editing.setIndex] = { weight, repsDone, done: repsDone != null };
      }
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
      const nextIndex = (currentIndex + 1) % options.length;

      ex.currentName = options[nextIndex];
      return copy;
    });
  }

  async function submitAllWorkouts() {
    const activeExercises = session.exercises.filter((ex) =>
      ex.sets.some((s) => s.repsDone > 0)
    );

    if (activeExercises.length === 0) {
      alert("Kirjaa vähintään yksi sarja!");
      return;
    }

    setLoading(true);

    try {
      for (const ex of activeExercises) {
        const data = {
          workoutType: mode,
          muscleGroup: ex.muscleGroup || "Savvy Lift",
          exerciseName: ex.currentName || ex.name,
          s1_reps: ex.sets[0]?.repsDone || "",
          s1_weight: ex.sets[0]?.weight || "",
          s2_reps: ex.sets[1]?.repsDone || "",
          s2_weight: ex.sets[1]?.weight || "",
          s3_reps: ex.sets[2]?.repsDone || "",
          s3_weight: ex.sets[2]?.weight || "",
          s4_reps: ex.sets[3]?.repsDone || "",
          s4_weight: ex.sets[3]?.weight || "",
          s5_reps: ex.sets[4]?.repsDone || "",
          s5_weight: ex.sets[4]?.weight || ""
        };

        await sendWorkoutToGoogle(data);
      }

      const newEntry = {
        id: Date.now(),
        mode,
        createdAt: new Date().toISOString(),
        exercises: JSON.parse(JSON.stringify(activeExercises))
      };

      const history = JSON.parse(localStorage.getItem("workout_sessions") || "[]");
      localStorage.setItem("workout_sessions", JSON.stringify([...history, newEntry]));

      setLoading(false);
      alert("✅ Valmis! Treeni tallennettu.");
      window.location.reload();
    } catch (err) {
      setLoading(false);
      alert("Virhe tallennuksessa!");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h1 style={{ margin: 0, fontWeight: 900 }}>{template.title}</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={() => setMode("A")} style={mode === "A" ? chipActive : chip}>
          Treeni A
        </button>
        <button onClick={() => setMode("B")} style={mode === "B" ? chipActive : chip}>
          Treeni B
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {session.exercises.map((ex) => {
          const info = getRecommendation(
            ex.currentName || ex.name,
            ex.targetReps,
            ex.increment || 2.5,
            sheetsHistory
          );

          return (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              sets={ex.sets}
              onEditSet={openEdit}
              onSwapExercise={swapExercise}
              recommendation={info}
            />
          );
        })}
      </div>

      <button
        onClick={submitAllWorkouts}
        disabled={loading}
        style={{
          ...submitBtnStyle,
          background: loading ? "#9ca3af" : "#22c55e",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Tallennetaan..." : "Lähetä ja tallenna"}
      </button>

      {editing && (
        <EditModal
          exercise={session.exercises.find((e) => e.id === editing.exerciseId)}
          setIndex={editing.setIndex}
          onSave={saveSet}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditModal({ exercise, setIndex, onClose, onSave }) {
  const current = exercise.sets?.[setIndex] || { weight: null, repsDone: null };
  const [weight, setWeight] = useState(current.weight ?? "");
  const [reps, setReps] = useState(current.repsDone ?? "");

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontWeight: 900, marginBottom: 15 }}>
          {(exercise.currentName || exercise.name)} - Sarja {setIndex + 1}
        </div>

        <label style={label}>Paino (kg)</label>
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          inputMode="decimal"
          style={input}
        />

        <label style={label}>Toistot</label>
        <input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          inputMode="numeric"
          style={input}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={btnSecondary}>Peru</button>
          <button onClick={() => onSave(toNum(weight), toNum(reps))} style={btnPrimary}>
            Tallenna
          </button>
        </div>
      </div>
    </div>
  );
}

function toNum(v) {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const chip = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.1)",
  background: "#eee",
  fontWeight: 800,
  cursor: "pointer"
};

const chipActive = {
  ...chip,
  background: "#111",
  color: "#fff"
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 20
};

const modal = {
  width: "100%",
  maxWidth: 350,
  background: "#fff",
  borderRadius: 20,
  padding: 20,
  boxSizing: "border-box"
};

const label = {
  display: "block",
  fontSize: 13,
  fontWeight: 800,
  marginTop: 10
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 5,
  boxSizing: "border-box",
  fontSize: "16px"
};

const btnPrimary = {
  flex: 1,
  padding: 14,
  background: "#111",
  color: "#fff",
  borderRadius: 12,
  border: "none",
  fontWeight: 800,
  cursor: "pointer"
};

const btnSecondary = {
  flex: 1,
  padding: 14,
  background: "#eee",
  borderRadius: 12,
  border: "none",
  fontWeight: 800,
  cursor: "pointer"
};

const submitBtnStyle = {
  width: "100%",
  marginTop: 30,
  padding: 18,
  color: "#fff",
  borderRadius: 16,
  border: "none",
  fontWeight: 900,
  fontSize: 16,
  transition: "0.2s"
};