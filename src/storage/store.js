const KEY = "workout_sessions"; // Synkronoitu muiden tiedostojen kanssa

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
    // Käytetään Date.now() jos randomUUID takkuaa
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now(),
    createdAt: new Date().toISOString(),
    mode,
    title: template.title,
    exercises: template.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      sets: Array.from({ length: ex.targetSets }, () => ({
        weight: null,
        repsDone: null
      }))
    }))
  };
}

// MUUTETTU: Ei tallenna treeniä muistiin ennen kuin käyttäjä oikeasti tekee jotain
export function getOrCreateTodaySession(template, mode) {
  return createSessionFromTemplate(template, mode);
}