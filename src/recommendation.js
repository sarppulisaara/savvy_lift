// Savvy Lift – painosuositukset historian perusteella.
//
// Tämä tiedosto VAIN LUKEE historiaa. Se ei muuta liikkeiden nimiä, Sheetin
// sarakkeita (exercisename, s1_weight, s1_reps ...) eikä tallennusta.
//
// Säännöt (tuplaprogressio):
//  - Työsarjat = viimeisimmän kerran sarjat suurimmalla painolla (lämmittelyt jäävät pois).
//  - Kaikki työsarjat haarukan yläpäähän            -> NOSTA (+ increment)
//  - Työsarjat alle haarukan kahtena kertana putkeen
//    samalla painolla                                 -> KEVENNÄ (- increment)
//  - Muuten                                           -> PIDÄ paino, tavoittele lisää toistoja
//  - Yli GAP_DAYS päivää edellisestä kerrasta         -> palaa n. 90 %:lla

import { formatDuration } from './exerciseTypes.js';

export const GAP_DAYS = 14;
export const BODYWEIGHT_MAX = 1; // 0 tai 1 kg = kehonpaino (esim. Dead Bug, lankku)

export const parseNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const n = parseFloat(String(val).replace("'", "").replace(',', '.').trim());
  return isNaN(n) ? 0 : n;
};

const fmt = (n) => String(parseFloat(Number(n).toFixed(2)));

// Aikaleima voi olla "2.11.2026 15.38", "16.2.2026 klo 11.40.26" tai ISO-muoto.
// Palauttaa millisekunnit tai NaN.
export const parseTimestamp = (raw) => {
  if (raw === null || raw === undefined || raw === '') return NaN;
  const s = String(raw).replace("'", "").trim();
  const fi = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\D+(\d{1,2})[.:](\d{2}))?/);
  if (fi) {
    const [, d, m, y, hh = '0', mm = '0'] = fi;
    return new Date(+y, +m - 1, +d, +hh, +mm).getTime();
  }
  const t = Date.parse(s);
  return isNaN(t) ? NaN : t;
};

export const rowName = (h) =>
  String(h.exercisename || h.Liike || h.liike || h.exerciseName || h.ExerciseName || '')
    .toLowerCase().trim();

export const rowSets = (h) => {
  const sets = [];
  for (let i = 1; i <= 5; i++) {
    const weight = parseNum(h[`s${i}_weight`]);
    const reps = parseNum(h[`s${i}_reps`]);
    if (weight > 0 || reps > 0) sets.push({ weight, reps });
  }
  if (sets.length === 0) {
    const weight = parseNum(h.Paino || h.paino || h.Weight);
    const reps = parseNum(h.Toistot || h.toistot || h.Reps);
    if (weight > 0 || reps > 0) sets.push({ weight, reps });
  }
  return sets;
};

// Kaikki tämän liikkeen historiarivit vanhimmasta uusimpaan.
// Nimen pitää vastata liikkeen nimeä tai sen aliasta KOKONAAN (ei osittaista osumaa,
// jotta esim. "Smith Bulgarian Split Squat" ei poimi käsipainobulgarialaisen rivejä).
export const findHistory = (history, name, dictionary) => {
  const terms = new Set([name, ...((dictionary && dictionary[name]) || [])]
    .map(n => String(n).toLowerCase().trim()));
  return (history || [])
    .map((h, index) => ({ h, index, time: parseTimestamp(h.Aikaleima ?? h.aikaleima ?? h.Timestamp) }))
    .filter(({ h }) => terms.has(rowName(h)))
    .map(({ h, index, time }) => ({ index, time, sets: rowSets(h) }))
    .filter(s => s.sets.length > 0)
    .sort((a, b) => {
      const ta = isNaN(a.time) ? null : a.time;
      const tb = isNaN(b.time) ? null : b.time;
      if (ta !== null && tb !== null && ta !== tb) return ta - tb;
      return a.index - b.index; // sama tai puuttuva aika -> taulukon järjestys
    });
};

// Kaikki painot, joilla liikettä on aiemmin tehty (nousevassa järjestyksessä).
// Suositukset pysyvät näin painoissa, jotka laitteesta oikeasti löytyvät.
const usedWeights = (sessions) => {
  const set = new Set();
  sessions.forEach(s => s.sets.forEach(x => { if (x.weight > 0) set.add(x.weight); }));
  return [...set].sort((a, b) => a - b);
};

const EPS = 1e-9;

const analyse = (session) => {
  const top = Math.max(...session.sets.map(s => s.weight));
  const work = session.sets.filter(s => s.weight === top && s.reps > 0);
  const avgReps = work.length ? work.reduce((a, s) => a + s.reps, 0) / work.length : 0;
  return { top, work, avgReps };
};

const parseRange = (range) => {
  const parts = String(range || '').split('-').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { min: parts[0], max: parts[1] };
  if (parts.length === 1 && !isNaN(parts[0])) return { min: parts[0], max: parts[0] };
  return null;
};

export const getRecommendation = (history, name, range, increment, dictionary, now = Date.now(), type = 'weight') => {
  const sessions = findHistory(history, name, dictionary);
  if (sessions.length === 0) return { text: 'Ei historiaa', status: 'normal' };

  const last = sessions[sessions.length - 1];
  const a = analyse(last);
  const repsText = a.work.map(s => fmt(s.reps)).join('/');

  // Kehonpainoliikkeet: näytetään vain toistot.
  // Kehonpaino- ja aikaliikkeet (ilman lisäpainoa): suositus toistoista tai sekunneista.
  if (a.top <= BODYWEIGHT_MAX) {
    const r0 = parseRange(range);
    const vals = last.sets.map(s => s.reps).filter(v => v > 0);
    if (vals.length === 0) return { text: 'Viimeksi: -', status: 'normal' };

    if (type === 'time') {
      const shown = vals.map(formatDuration).join(' / ');
      const lastT = `Viimeksi ${shown}`;
      if (r0 && vals.every(v => v >= r0.max)) {
        return { text: `Tavoite täynnä! Kokeile vaikeampaa versiota tai lisäpainoa (${lastT})`, status: 'level-up' };
      }
      // Tavoite: lyhintä sarjaa 5 s pidempi jokaisessa sarjassa, kuitenkin haarukan sisällä.
      const target = Math.min(r0 ? r0.max : Infinity, Math.max(r0 ? r0.min : 0, Math.min(...vals) + 5));
      return { text: `Tavoite: ${formatDuration(target)} jokaisessa sarjassa (${lastT})`, status: 'normal' };
    }

    const shown = vals.map(fmt).join('/');
    const lastT = `Viimeksi ${shown} toistoa`;
    if (r0 && vals.every(v => v >= r0.max)) {
      return { text: `Tavoite täynnä! Vaikeuta liikettä tai lisää painoa (${lastT})`, status: 'level-up' };
    }
    return { text: r0 ? `Tavoite: ${r0.max}/sarja (${lastT})` : lastT, status: 'normal' };
  }

  const lastText = `Viimeksi ${fmt(a.top)}kg: ${repsText}`;
  const inc = parseNum(increment);
  const r = parseRange(range);
  const weights = usedWeights(sessions);

  // Tauko: palaa noin 90 %:lla, pyöristettynä liikkeen omaan painoaskeleeseen.
  const daysSince = isNaN(last.time) ? 0 : (now - last.time) / 86400000;
  if (daysSince > GAP_DAYS && inc > 0) {
    const steps = Math.max(1, Math.round((a.top * 0.1) / inc));
    const computed = Math.max(inc, a.top - steps * inc);
    // Mieluummin aiemmin käytetty paino, joka on enintään lasketun 90 %:n verran.
    const known = weights.filter(w => w <= computed + EPS);
    const back = known.length ? known[known.length - 1] : computed;
    return {
      text: `Tauon jälkeen: ${fmt(back)}kg (${lastText}, ${Math.floor(daysSince)} pv sitten)`,
      status: 'deload'
    };
  }

  if (!r || inc <= 0 || a.work.length === 0) return { text: lastText, status: 'normal' };

  // Kaikki työsarjat haarukan yläpäähän -> nosta.
  if (a.work.every(s => s.reps >= r.max)) {
    // Pienin aiemmin käytetty paino nykyisen yläpuolella (enintään 3 askelta), muuten + increment.
    const next = weights.find(w => w > a.top + EPS && w <= a.top + 3 * inc + EPS);
    return { text: `Suositus: ${fmt(next ?? a.top + inc)}kg (${lastText})`, status: 'level-up' };
  }

  // Kaksi kertaa peräkkäin samalla painolla alle haarukan -> kevennä.
  const prev = sessions.length > 1 ? analyse(sessions[sessions.length - 2]) : null;
  if (a.avgReps < r.min && prev && prev.top === a.top && prev.avgReps < r.min && a.top - inc > 0) {
    const lower = weights.filter(w => w < a.top - EPS);
    const lighter = lower.length ? lower[lower.length - 1] : a.top - inc;
    return { text: `Kevennä: ${fmt(lighter)}kg, tavoite ${r.min}-${r.max} (${lastText})`, status: 'deload' };
  }

  return { text: `Pidä ${fmt(a.top)}kg, tavoite ${r.max}/sarja (${lastText})`, status: 'normal' };
};
