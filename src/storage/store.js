const KEY = "workout_sessions";

export function loadSessions() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function upsertSession(session) {
  const sessions = loadSessions();
  const index = sessions.findIndex((s) => s.id === session.id);

  if (index === -1) {
    sessions.push(session);
  } else {
    sessions[index] = session;
  }

  saveSessions(sessions);
  return sessions;
}

export function createSessionFromTemplate(template, mode) {
  return {
    id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now(),
    createdAt: new Date().toISOString(),
    mode,
    title: template.title,
    exercises: template.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      baseName: ex.name,
      currentName: ex.name,
      alternatives: ex.alternatives || [],
      muscleGroup: ex.muscleGroup,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      increment: ex.increment || 2.5,
      sets: Array.from({ length: ex.targetSets }, () => ({
        weight: null,
        repsDone: null
      }))
    }))
  };
}

export function getOrCreateTodaySession(template, mode) {
  return createSessionFromTemplate(template, mode);
}