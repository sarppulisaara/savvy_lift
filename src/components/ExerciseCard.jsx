import React from "react";

export function ExerciseCard({ exercise, sets, onEditSet }) {
  const cardStyle = {
    background: "#fff",
    borderRadius: 22,
    padding: 16,
    boxShadow: "0 8px 26px rgba(0,0,0,0.08)",
    marginBottom: 14
  };

  const titleRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.2
  };

  const targetStyle = {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 6
  };

  const pillsRow = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14
  };

  const targetForDisplay = pickTargetNumber(exercise.targetReps);

  return (
    <div style={cardStyle}>
      <div style={titleRow}>
        <div>
          <div style={titleStyle}>{exercise.name}</div>
          <div style={targetStyle}>
            {exercise.targetSets} sarjaa x {exercise.targetReps} toistoa
          </div>
        </div>

        <button
          type="button"
          style={{
            border: "none",
            background: "transparent",
            fontSize: 20,
            cursor: "pointer"
          }}
          aria-label="Lisätoiminnot"
          onClick={() => alert("Myöhemmin: vaihda liike, ohje, muistiinpano")}
        >
          ⋮
        </button>
      </div>

      <div style={pillsRow}>
        {Array.from({ length: exercise.targetSets }, (_, i) => {
        const s = sets?.[i] || { weight: null, repsDone: null };
const isDone = s.repsDone != null;
const bg = isDone ? "#2563eb" : "#111827"; // sininen kun tehty
          const top = s.weight != null ? `${s.weight}kg` : "";
          const reps = s.repsDone != null ? s.repsDone : 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onEditSet(exercise.id, i)}
              style={{
                width: 92,
                height: 66,
                borderRadius: 18,
                border: "none",
                background: bg,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer"
              }}
              title="Klikkaa ja syötä sarja"
            >
              <div style={{ fontSize: 12, opacity: 0.9, minHeight: 14 }}>
                {top}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {targetForDisplay != null ? `${reps}/${targetForDisplay}` : `${reps}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function pickTargetNumber(targetReps) {
  if (!targetReps) return null;
  const s = String(targetReps);

  if (s.includes("-")) {
    const parts = s.split("-").map((x) => parseInt(x.trim(), 10));
    if (Number.isFinite(parts[1])) return parts[1];
    return null;
  }

  const n = parseInt(s.trim(), 10);
  return Number.isFinite(n) ? n : null;
}
