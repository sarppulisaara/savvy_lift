import { useState } from "react";
import Workout from "./pages/Workout";
import History from "./pages/History";

export default function App() {
  const [page, setPage] = useState("workout");

  return (
    // TÄMÄ TAUSTA: Tekee läppärillä harmaan taustan
    <div style={desktopWrapper}>
      <div style={appContainer}>
        <TopNav page={page} setPage={setPage} />
        <div style={contentArea}>
          {page === "workout" ? (
            <Workout />
          ) : (
            <History />
          )}
        </div>
      </div>
    </div>
  );
}

function TopNav({ page, setPage }) {
  return (
    <div style={nav}>
      <div style={navInner}>
        <button
          type="button"
          onClick={() => setPage("workout")}
          style={page === "workout" ? navActive : navBtn}
        >
          Treeni
        </button>
        <button
          type="button"
          onClick={() => setPage("history")}
          style={page === "history" ? navActive : navBtn}
        >
          Historia
        </button>
      </div>
    </div>
  );
}

// --- TYYLIT ---

const desktopWrapper = {
  background: "#f0f2f5", // Harmaa tausta läppärille
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center" // Keskittää sovelluksen
};

const appContainer = {
  maxWidth: "420px",
  margin: "0 auto",
  width: "100%",
  minHeight: "100vh",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 0 50px rgba(0,0,0,0.05)" // Tuo "puhelin" esiin harmaasta taustasta
};

const contentArea = {
  flex: 1,
  paddingBottom: "40px"
};

const nav = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#111827", // Tumma navi näyttää paremmalta
  padding: "16px",
  borderBottom: "1px solid rgba(255,255,255,0.1)"
};

const navInner = {
  display: "flex",
  gap: 12,
  justifyContent: "center"
};

const navBtn = {
  padding: "10px 20px",
  borderRadius: "12px",
  border: "none",
  background: "#374151",
  color: "#9ca3af",
  fontWeight: 800,
  cursor: "pointer",
  flex: 1,
  fontSize: "14px",
  transition: "0.2s"
};

const navActive = {
  ...navBtn,
  background: "#fff",
  color: "#111827"
};