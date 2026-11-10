// Savvy Lift – liiketyypit.
//
//  'weight'     = kg + toistot (oletus kaikille liikkeille, joita ei ole listattu alla)
//  'bodyweight' = vain toistot. Paino-sarake jää Sheetissä tyhjäksi, ellei käytetä lisäpainoa.
//  'time'       = aika. Sekunnit tallennetaan Sheetin toistosarakkeeseen (s1_reps jne.),
//                 joten Sheetin rakenne ja Apps Script pysyvät ennallaan.
//
// Vanhat 0- ja 1-kilon merkinnät tulkitaan edelleen kehonpainoksi.

export const EXERCISE_TYPES = {
  'Lankku': 'time',
  'Dead Bug': 'bodyweight',
  'Jalkojen nostot selinmakuulla': 'bodyweight',
  'Vatsarutistus jumppapallolla': 'bodyweight',
  'Voimapyörä': 'bodyweight',
  'Yhden jalan lantionnosto': 'bodyweight',
  'Kuminauhakävely sivuttain': 'bodyweight',
  'Kylkilankku jalan nostolla': 'time'
};

export const getExerciseType = (name) => EXERCISE_TYPES[name] || 'weight';

// "0:45", "0.45", "0,45", "1:05" = minuutit:sekunnit, pelkkä luku = sekunnit ("45").
// Palauttaa sekunnit tai null, jos syöte ei ole aika.
export const parseDuration = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).replace("'", '').trim();
  if (s === '') return null;
  const m = s.match(/^(\d+)\s*[:.,]\s*(\d{1,2})$/);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return null;
};

export const formatDuration = (seconds) => {
  const n = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
};
