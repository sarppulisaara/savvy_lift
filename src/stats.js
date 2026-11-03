// Savvy Lift – tilastot historiasta: viikkonäkymä, kehityskäyrä ja viimeisin muistiinpano.
// Kuten recommendation.js, tämä VAIN LUKEE historiaa eikä muuta mitään.

import { parseNum, parseTimestamp, findHistory } from './recommendation.js';

const rowName = (h) =>
  String(h.exercisename || h.Liike || h.liike || h.exerciseName || h.ExerciseName || '')
    .toLowerCase().trim();

const rowTime = (h) => parseTimestamp(h.Aikaleima ?? h.aikaleima ?? h.Timestamp);

// Maanantai klo 00.00 sillä viikolla, jolla `now` on.
export const weekStart = (now = Date.now()) => {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // ma = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
};

const countSets = (sets) => sets.filter(s => parseNum(s.reps) > 0).length;

// Lihasryhmä liikkeen nimestä sovelluksen omista liikemäärittelyistä,
// varalla historiarivin oma musclegroup-arvo.
const buildMuscleLookup = (exercises, dictionary) => {
  const map = new Map();
  exercises.forEach(ex => {
    [ex.name, ...((dictionary && dictionary[ex.name]) || [])]
      .forEach(n => map.set(String(n).toLowerCase().trim(), ex.muscle));
  });
  return map;
};

// Tämän viikon sarjat lihasryhmittäin. `active` = meneillään oleva treeni (ei vielä tallennettu).
export const getWeekSummary = (history, exercises, dictionary, active = null, now = Date.now()) => {
  const start = weekStart(now);
  const lookup = buildMuscleLookup(exercises, dictionary);
  const saved = {};
  const today = {};
  const sessionKeys = new Set();

  (history || []).forEach(h => {
    const t = rowTime(h);
    if (isNaN(t) || t < start || t > now + 86400000) return;
    const sets = [];
    for (let i = 1; i <= 5; i++) sets.push({ reps: h[`s${i}_reps`] });
    const n = countSets(sets);
    if (n === 0) return;
    const muscle = lookup.get(rowName(h)) || String(h.musclegroup || '').trim() || 'Muu';
    saved[muscle] = (saved[muscle] || 0) + n;
    const d = new Date(t);
    sessionKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  (active?.exercises || []).forEach(ex => {
    const n = countSets(ex.sets || []);
    if (n === 0) return;
    const muscle = lookup.get(String(ex.currentName).toLowerCase().trim()) || ex.muscle || 'Muu';
    today[muscle] = (today[muscle] || 0) + n;
  });

  return { start, sessions: sessionKeys.size, saved, today };
};

// Kehitys liikkeittäin: jokaisesta kerrasta suurin paino ja sen sarjojen toistot.
export const getProgress = (history, name, dictionary) =>
  findHistory(history, name, dictionary).map(s => {
    const top = Math.max(...s.sets.map(x => x.weight));
    const work = s.sets.filter(x => x.weight === top);
    return {
      time: s.time,
      top,
      reps: work.map(x => x.reps),
      allSets: s.sets
    };
  });

// Viimeisin ei-tyhjä muistiinpano tälle liikkeelle.
export const getLastNote = (history, name, dictionary) => {
  const terms = new Set([name, ...((dictionary && dictionary[name]) || [])]
    .map(n => String(n).toLowerCase().trim()));
  let best = null;
  (history || []).forEach((h, index) => {
    const note = String(h.notes ?? h.Notes ?? '').replace(/^'/, '').trim();
    if (!note || !terms.has(rowName(h))) return;
    const time = rowTime(h);
    const key = isNaN(time) ? -Infinity : time;
    if (!best || key > best.key || (key === best.key && index > best.index)) {
      best = { note, time, key, index };
    }
  });
  return best ? { note: best.note, time: best.time } : null;
};

export const formatDate = (time) => {
  if (isNaN(time)) return '';
  const d = new Date(time);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
};
