import React from 'react';
import { formatDate } from './stats.js';

// Viikkonäkymä: tämän viikon (ma–su) sarjat lihasryhmittäin.
// Treenin aikana mukana näkyvät myös meneillään olevan treenin kirjatut sarjat,
// jotta ruuhkassa liikkeitä vaihtaessa näkee, mitkä ryhmät ovat jäämässä vähälle.
export default function WeekView({ summary, muscleOrder, compact = false }) {
  const groups = [
    ...muscleOrder,
    ...Object.keys({ ...summary.saved, ...summary.today }).filter(m => !muscleOrder.includes(m))
  ];
  const rows = groups.map(m => ({
    muscle: m,
    saved: summary.saved[m] || 0,
    today: summary.today[m] || 0
  }));
  const maxSets = Math.max(10, ...rows.map(r => r.saved + r.today));
  const hasToday = rows.some(r => r.today > 0);
  const end = summary.start + 6 * 86400000;

  return (
    <div className={`exercise-card week-card${compact ? ' compact' : ''}`}>
      <div className="week-head">
        <h2 className="exercise-title">Tämä viikko</h2>
        <span className="muscle-tag">
          {formatDate(summary.start)}–{formatDate(end)} · {summary.sessions} {summary.sessions === 1 ? 'treeni' : 'treeniä'}
        </span>
      </div>

      <div className="week-rows">
        {rows.map(r => {
          const total = r.saved + r.today;
          return (
            <div key={r.muscle} className={`week-row${total === 0 ? ' empty' : ''}`}>
              <span className="week-muscle">{r.muscle}</span>
              <span className="week-bar" aria-hidden="true">
                <span className="week-bar-saved" style={{ width: `${(r.saved / maxSets) * 100}%` }} />
                <span className="week-bar-today" style={{ width: `${(r.today / maxSets) * 100}%` }} />
              </span>
              <span className="week-count">{total}</span>
            </div>
          );
        })}
      </div>

      <p className="chart-caption">
        Sarjoja lihasryhmittäin{hasToday ? ' · vaaleampi osa = tämä treeni' : ''}
      </p>
    </div>
  );
}
