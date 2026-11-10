// Savvy Lift – treenipalaute: suoritusindeksi ja palauterivien jäsennys.
// Kuten recommendation.js, tämä VAIN LUKEE historiaa eikä muuta mitään.
//
// Suoritusindeksi (per treenipäivä): jokaiselle liikkeelle verrataan parhaan sarjan
// arvioitua maksimia saman liikkeen edelliseen kertaan (%-muutos), ja päivän indeksi
// on näiden mediaani. Liikkeen ensimmäinen kerta ohitetaan (ei vertailukohtaa).
//  - Painoliike: Epley, paino × (1 + toistot / 30)
//  - Kehonpaino- ja aikaliike (ei lisäpainoa): paras toisto- tai sekuntimäärä

import { parseNum, parseTimestamp, rowName, rowSets, BODYWEIGHT_MAX } from './recommendation.js';

export const FEEDBACK_FEELINGS = ['kevyt', 'normaali', 'raskas'];
export const FEEDBACK_TAGS = ['väsynyt', 'turvonnut', 'jumissa', 'kipeä', 'hyvä flow'];

export const dayStart = (time) => {
  const d = new Date(time);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const median = (values) => {
  const v = [...values].sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
};

const epley = (weight, reps) => weight * (1 + reps / 30);

// Liikkeen paras suoritus yhdeltä päivältä: { kind: 'load' | 'reps', value } tai null.
const bestOfRow = (sets) => {
  const loaded = sets.filter(s => s.weight > BODYWEIGHT_MAX && s.reps > 0);
  if (loaded.length) return { kind: 'load', value: Math.max(...loaded.map(s => epley(s.weight, s.reps))) };
  const reps = Math.max(0, ...sets.map(s => s.reps));
  return reps > 0 ? { kind: 'reps', value: reps } : null;
};

// Kaikki treenipäivät vanhimmasta uusimpaan: [{ day, time, index, items: [{ name, pct }] }].
// index = null, jos päivältä ei löydy yhtään vertailukelpoista liikettä.
export const getPerformance = (history, dictionary) => {
  const canon = new Map();
  Object.entries(dictionary || {}).forEach(([name, aliases]) => {
    canon.set(name.toLowerCase().trim(), name);
    aliases.forEach(a => canon.set(String(a).toLowerCase().trim(), name));
  });

  const byExercise = new Map(); // nimi -> Map(päivä -> { kind, value })
  const days = new Map();       // päivä -> { day, time, items }

  (history || []).forEach(h => {
    const time = parseTimestamp(h.Aikaleima ?? h.aikaleima ?? h.Timestamp);
    const raw = rowName(h);
    if (isNaN(time) || !raw) return;
    const best = bestOfRow(rowSets(h));
    if (!best) return;
    const name = canon.get(raw) || raw;
    const day = dayStart(time);

    const d = days.get(day) || { day, time, items: [] };
    d.time = Math.max(d.time, time);
    days.set(day, d);

    const perDay = byExercise.get(name) || new Map();
    const old = perDay.get(day);
    // Sama liike samana päivänä kahdesti: paino-arvio voittaa, muuten suurempi arvo.
    if (!old || (best.kind === 'load' && old.kind !== 'load') || (best.kind === old.kind && best.value > old.value)) {
      perDay.set(day, best);
    }
    byExercise.set(name, perDay);
  });

  byExercise.forEach((perDay, name) => {
    const ordered = [...perDay.entries()].sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < ordered.length; i++) {
      const [day, cur] = ordered[i];
      const prev = ordered[i - 1][1];
      if (cur.kind !== prev.kind || prev.value <= 0) continue;
      days.get(day).items.push({ name, pct: (cur.value / prev.value - 1) * 100 });
    }
  });

  return [...days.values()]
    .sort((a, b) => a.day - b.day)
    .map(d => {
      const m = median(d.items.map(i => i.pct));
      return { ...d, index: m === null ? null : Math.round(m * 10) / 10 };
    });
};

// Palaute-välilehden rivit -> siistitty lista (vanhin ensin). Rivit, joilla ei ole palautekenttiä
// (esim. jos vanha Apps Script palauttaa Form_Responses-rivejä), jätetään pois.
export const parseFeedbackRows = (rows) => (Array.isArray(rows) ? rows : [])
  .filter(r => r && ('energia' in r || 'tuntuma' in r || 'uni' in r))
  .map(r => {
    const time = parseTimestamp(r.Aikaleima ?? r.aikaleima);
    return {
      time,
      day: isNaN(time) ? NaN : dayStart(time),
      workoutType: String(r.workoutType || ''),
      energia: parseNum(r.energia) || null,
      uni: parseNum(r.uni) || null,
      tuntuma: String(r.tuntuma || '').replace(/^'/, '').trim(),
      tuntemukset: String(r.tuntemukset || '').replace(/^'/, '').split(',').map(s => s.trim()).filter(Boolean),
      muistiinpano: String(r.muistiinpano || '').replace(/^'/, '').trim()
    };
  })
  .filter(r => !isNaN(r.time))
  .sort((a, b) => a.time - b.time);

// Sheetiin lähtevä palauterivi (lähetetään samassa POSTissa treenirivien kanssa).
export const buildFeedbackRow = (workoutType, aikaleima, f) => ({
  type: 'feedback',
  Aikaleima: aikaleima,
  workoutType,
  energia: f.energia || '',
  uni: f.uni || '',
  tuntuma: f.tuntuma || '',
  tuntemukset: (f.tuntemukset || []).join(', '),
  // Heittomerkki estää Sheetsiä tulkitsemasta =- tai +-alkuista tekstiä kaavaksi.
  muistiinpano: f.muistiinpano && f.muistiinpano.trim() ? "'" + f.muistiinpano.trim() : ''
});

export const hasFeedback = (f) =>
  !!(f.energia || f.uni || f.tuntuma || (f.tuntemukset && f.tuntemukset.length) || (f.muistiinpano && f.muistiinpano.trim()));
