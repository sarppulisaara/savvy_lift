import { useEffect, useMemo, useState } from "react";
import { workoutTemplates } from "../data/template";
import { ExerciseCard } from "../components/ExerciseCard";
import { getOrCreateTodaySession } from "../storage/store";

// VARMISTA ETTÄ TÄMÄ ON UUSIN URL GOOGLESTA (Deploy -> New Deployment)
const API_URL = "https://script.google.com/macros/s/AKfycbzYmQHU3eHyNOWBAevAH4xWDj7PWHppmhmgIaZHgVlyC6Q0NP-ApPREIpXEkzvv5iJf/exec";

async function sendWorkoutToGoogle(data) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log("✅ Lähetetty:", data.exerciseName);
  } catch (e) {
    console.error("❌ Virhe lähetyksessä:", e);
  }
}

export default function Workout() {
  const [mode, setMode] = useState("A");
  const [loading, setLoading] = useState(false); // Lataustila hitauden hallintaan
  const template = useMemo(() => workoutTemplates[mode], [mode]);
  const [session, setSession] = useState(() => getOrCreateTodaySession(workoutTemplates.A, "A"));
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setSession(getOrCreateTodaySession(template, mode));
  }, [mode, template]);

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

  async function submitAllWorkouts() {
    const activeExercises = session.exercises.filter(ex => 
      ex.sets.some(s => s.repsDone > 0)
    );

    if (activeExercises.length === 0) {
      alert("Kirjaa vähintään yksi sarja!");
      return;
    }

    setLoading(true); // Estää tuplaklikit ja näyttää käyttäjälle että jotain tapahtuu

    try {
      // Lähetetään kaikki liikkeet putkeen ilman turhia viiveitä
      for (const ex of activeExercises) {
        const data = {
          workoutType: mode,
          muscleGroup: ex.muscleGroup || "Savvy Lift",
          exerciseName: ex.name,
          s1_reps: ex.sets[0]?.repsDone || "",
          s1_weight: ex.sets[0]?.weight || "",
          s2_reps: ex.sets[1]?.repsDone || "",
          s2_weight: ex.sets[1]?.weight || "",
          s3_reps: ex.sets[2]?.repsDone || "",
          s3_weight: ex.sets[2]?.weight || "",
          s4_reps: ex.sets[3]?.repsDone || ""
        };
        await sendWorkoutToGoogle(data);
      }

      // Tallennus paikalliseen historiaan vasta kun lähetys on tehty
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
        <button onClick={() => setMode("A")} style={mode === "A" ? chipActive : chip}>Treeni A</button>
        <button onClick={() => setMode("B")} style={mode === "B" ? chipActive : chip}>Treeni B</button>
      </div>
      
      <div style={{ marginTop: 20 }}>
        {session.exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} sets={ex.sets} onEditSet={openEdit} />
        ))}
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
        {loading ? "Tallennetaan..." : "📤 Lähetä ja tallenna"}
      </button>

      {editing && (
        <EditModal 
          exercise={session.exercises.find(e => e.id === editing.exerciseId)} 
          setIndex={editing.setIndex} 
          onSave={saveSet} 
          onClose={() => setEditing(null)} 
        />
      )}
    </div>
  );
}

// --- APUKOMPONENTIT JA CSS (Tässä on fiksit laatikoihin) ---

function EditModal({ exercise, setIndex, onClose, onSave }) {
  const current = exercise.sets?.[setIndex] || { weight: null, repsDone: null };
  const [weight, setWeight] = useState(current.weight ?? "");
  const [reps, setReps] = useState(current.repsDone ?? "");

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontWeight: 900, marginBottom: 15 }}>{exercise.name} - Sarja {setIndex + 1}</div>
        
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
          <button onClick={() => onSave(toNum(weight), toNum(reps))} style={btnPrimary}>Tallenna</button>
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

// TYYLIT (Tässä on se box-sizing: border-box fiksi)
const chip = { padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "#eee", fontWeight: 800, cursor: "pointer" };
const chipActive = { ...chip, background: "#111", color: "#fff" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modal = { width: "100%", maxWidth: 350, background: "#fff", borderRadius: 20, padding: 20, boxSizing: "border-box" };
const label = { display: "block", fontSize: 13, fontWeight: 800, marginTop: 10 };
const input = { 
  width: "100%", 
  padding: "12px", 
  borderRadius: 10, 
  border: "1px solid #ccc", 
  marginTop: 5, 
  boxSizing: "border-box", // Estää laatikoiden leviämisen reunan yli
  fontSize: "16px" 
};
const btnPrimary = { flex: 1, padding: 14, background: "#111", color: "#fff", borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer" };
const btnSecondary = { flex: 1, padding: 14, background: "#eee", borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer" };
const submitBtnStyle = { width: "100%", marginTop: 30, padding: 18, color: "#fff", borderRadius: 16, border: "none", fontWeight: 900, fontSize: 16, transition: "0.2s" };