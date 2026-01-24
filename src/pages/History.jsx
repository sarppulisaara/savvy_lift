import React, { useState, useEffect } from "react";
import { loadSessions } from "../storage/store";

const API_URL = "https://script.google.com/macros/s/AKfycbzBzyXv_yDjK_lagkW5ZOXzMniOLIO0aWhhgC8mK_zo8zvGrv9kUW-lGJFJHIEn0jVC5A/exec";

export default function History() {
  const [expandedId, setExpandedId] = useState(null);
  const [cloudSessions, setCloudSessions] = useState([]);
  const [view, setView] = useState("local");
  const [localSessions, setLocalSessions] = useState([]);

  // Latausfunktio, jota voidaan kutsua useasti
  const refreshLocal = () => {
    const s = loadSessions();
    setLocalSessions([...s].reverse());
  };

  useEffect(() => {
    refreshLocal();
  }, []);

  useEffect(() => {
    if (view === "cloud") {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => setCloudSessions(data))
        .catch(err => console.error("Sheets-haku epäonnistui", err));
    }
  }, [view]);

 const handleDeleteLocal = (id) => {
    if (window.confirm("Poistetaanko tämä treeni lopullisesti?")) {
      // 1. Poistetaan se päälistasta
      const allSessions = JSON.parse(localStorage.getItem("workout_sessions") || "[]");
      const filtered = allSessions.filter(s => s.id !== id);
      localStorage.setItem("workout_sessions", JSON.stringify(filtered));
      
      // 2. TÄRKEÄÄ: Tyhjennetään kaikki väliaikaiset avaimet, 
      // jotka saattavat palauttaa vanhan datan tallennusvaiheessa.
      localStorage.removeItem("workout_session_current");
      localStorage.removeItem("today_session_A");
      localStorage.removeItem("today_session_B");
      localStorage.removeItem("workout_session"); // Varmuuden vuoksi myös tämä

      // 3. Pakotetaan UI päivittymään
      setLocalSessions([]); 
      setTimeout(() => {
        setLocalSessions([...filtered].reverse());
      }, 50);
      
      console.log("Puhdistus suoritettu kaikista muistipaikoista.");
    }
  };

  const clearAll = () => {
    if (window.confirm("HUOM! Tämä poistaa KAIKKI treenit puhelimen muistista. Oletko varma?")) {
      localStorage.removeItem("workout_sessions");
      setLocalSessions([]);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Historia</h1>
        {localSessions.length > 0 && view === "local" && (
          <button onClick={clearAll} style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
            Tyhjennä kaikki
          </button>
        )}
      </div>
      
      <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 20 }}>
        <button onClick={() => setView("local")} style={view === "local" ? tabActive : tab}>Puhelin</button>
        <button onClick={() => setView("cloud")} style={view === "cloud" ? tabActive : tab}>Google Sheets</button>
      </div>

      {view === "local" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {localSessions.length === 0 ? (
            <div style={{ opacity: 0.5, padding: 20, textAlign: "center" }}>Ei tallennettuja treenejä.</div>
          ) : (
            localSessions.map((s) => (
              <LocalWorkoutCard 
                key={s.id} 
                session={s} 
                isExpanded={expandedId === s.id}
                onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                onDelete={() => handleDeleteLocal(s.id)}
              />
            ))
          )}
        </div>
      ) : (
        <CloudHistoryList sessions={cloudSessions} />
      )}
    </div>
  );
}

function LocalWorkoutCard({ session, isExpanded, onToggle, onDelete }) {
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onToggle} style={cardBtn}>
        {/* paddingRight: 64 takaa, ettei teksti mene ikinä napin alle */}
        <div style={{ paddingRight: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              {session.mode === "A" ? "🏋️ Treeni A" : "🏋️ Treeni B"}
            </div>
            <div style={{ opacity: 0.6, fontSize: 11, textAlign: "right", marginTop: 2 }}>
              {formatDateTime(session.createdAt)}
            </div>
          </div>
          <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>
            {completedSetsCount(session)} settiä tehty
          </div>
        </div>
      </button>

      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
        style={deleteBtnStyle}
      >
        ✕
      </button>

      {isExpanded && (
        <div style={expandedDetails}>
          {session.exercises?.map((ex, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{ex.name}</div>
              {ex.sets?.map((set, si) => (
                <div key={si} style={setRow}>
                  <span>Sarja {si + 1}</span>
                  <span style={{ fontWeight: 700 }}>
                    {set.repsDone ? `${set.repsDone} x ${set.weight || 0}kg` : "—"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CloudHistoryList({ sessions }) {
  if (sessions.length === 0) return <div style={{ opacity: 0.6, textAlign: "center", padding: 20 }}>Ladataan pilvistä...</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sessions.map((s, i) => (
        <div key={i} style={cardBtn}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 900, color: "#22c55e" }}>Treeni {s.workoutType}</span>
            <span style={{ opacity: 0.6, fontSize: 12 }}>{new Date(s.date).toLocaleDateString("fi-FI")}</span>
          </div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>{s.exerciseName}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {s.sets.map((set, si) => set.reps ? (
              <div key={si} style={pill}>{set.reps}x{set.weight}kg</div>
            ) : null)}
          </div>
        </div>
      ))}
    </div>
  );
}

function completedSetsCount(s) { 
  let done = 0;
  s?.exercises?.forEach(ex => ex.sets?.forEach(set => { if (set?.repsDone != null) done++; }));
  return done;
}

function formatDateTime(iso) { 
  if(!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fi-FI", {day:"2-digit", month:"2-digit"}) + " klo " + d.toLocaleTimeString("fi-FI", {hour:"2-digit", minute:"2-digit"});
}

const cardBtn = { textAlign: "left", border: "none", background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", color: "#111827", width: "100%" };
const deleteBtnStyle = { position: 'absolute', top: '14px', right: '12px', background: '#f3f4f6', color: '#9ca3af', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer', zIndex: 10 };
const expandedDetails = { background: "#f9fafb", borderRadius: "0 0 16px 16px", padding: 16, marginTop: -8, marginBottom: 10, borderLeft: "4px solid #111827", borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" };
const setRow = { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" };
const tab = { padding: "12px", borderRadius: 12, border: "none", background: "#e5e7eb", fontWeight: 800, cursor: "pointer", flex: 1 };
const tabActive = { ...tab, background: "#111827", color: "#fff" };
const pill = { background: "#f3f4f6", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 };