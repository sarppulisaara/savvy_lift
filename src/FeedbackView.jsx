import React, { useEffect, useMemo, useState } from 'react';
import { formatDate } from './stats.js';
import { getPerformance, parseFeedbackRows, dayStart } from './feedback.js';

const FEEDBACK_CACHE_KEY = 'savvy_lift_feedback_cache';
const WEEKS = 12;

// PALAUTE-näkymä: 12 viikon kaavio (energia 1–5 ja suoritusindeksi %) sekä lista viimeisistä treeneistä.
// Palaute haetaan Palaute-välilehdeltä (?sheet=palaute), suoritusindeksi lasketaan treenihistoriasta.
export default function FeedbackView({ apiUrl, history, dictionary, onClose }) {
  const [rows, setRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FEEDBACK_CACHE_KEY) || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [end] = useState(() => dayStart(Date.now())); // kaavion loppupäivä = avauspäivä

  useEffect(() => {
    fetch(`${apiUrl}?sheet=palaute`)
      .then(res => res.json())
      .then(data => {
        const parsed = Array.isArray(data) ? data : [];
        setRows(parsed);
        try { localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(parsed)); } catch { /* välimuisti ei pakollinen */ }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const feedback = useMemo(() => parseFeedbackRows(rows), [rows]);
  const performance = useMemo(() => getPerformance(history, dictionary), [history, dictionary]);

  const byDay = new Map(feedback.map(f => [f.day, f])); // sama päivä: myöhempi palaute voittaa
  const recent = performance.slice(-10).reverse().map(p => ({ ...p, fb: byDay.get(p.day) }));

  // Kaavio
  const start = end - WEEKS * 7 * 86400000;
  const energy = feedback.filter(f => f.energia && f.day >= start);
  const idx = performance.filter(p => p.index !== null && p.day >= start);
  const W = 320, H = 190, padL = 30, padR = 36, padT = 14, padB = 26;
  const x = (day) => padL + ((day - start) / (end - start || 1)) * (W - padL - padR);
  const yE = (v) => padT + (H - padT - padB) * (1 - (v - 1) / 4);
  const iMax = Math.max(10, ...idx.map(p => Math.abs(p.index)));
  const yI = (v) => padT + (H - padT - padB) * (1 - (v + iMax) / (2 * iMax));
  const line = (pts) => pts.map(p => `${p[0]},${p[1]}`).join(' ');
  const sign = (n) => (n > 0 ? '+' : '') + n;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="exercise-card modal-card" onClick={e => e.stopPropagation()}>
        <div className="exercise-header">
          <h2 className="exercise-title" style={{ flex: 1 }}>Palaute</h2>
          <button className="swap-action-btn" onClick={onClose}>SULJE</button>
        </div>

        {energy.length === 0 && idx.length === 0 ? (
          <p className="chart-empty">{loading ? 'Ladataan…' : 'Ei vielä palautetta tai vertailtavaa historiaa.'}</p>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="progress-chart" role="img" aria-label="Energia ja suoritusindeksi 12 viikolta">
              <line x1={padL} x2={W - padR} y1={yI(0)} y2={yI(0)} className="chart-grid" />
              <text x={W - padR + 4} y={yI(0) + 4} className="chart-label">0 %</text>
              <text x={W - padR + 4} y={yI(iMax) + 4} className="chart-label">{sign(Math.round(iMax))}</text>
              <text x={W - padR + 4} y={yI(-iMax) + 4} className="chart-label">{sign(-Math.round(iMax))}</text>
              <text x={padL - 6} y={yE(5) + 4} textAnchor="end" className="chart-label">5</text>
              <text x={padL - 6} y={yE(1) + 4} textAnchor="end" className="chart-label">1</text>
              {idx.length > 1 && <polyline points={line(idx.map(p => [x(p.day), yI(p.index)]))} className="chart-line index-line" />}
              {idx.map(p => <circle key={p.day} cx={x(p.day)} cy={yI(p.index)} r="3.5" className="chart-dot index-dot" />)}
              {energy.length > 1 && <polyline points={line(energy.map(f => [x(f.day), yE(f.energia)]))} className="chart-line" />}
              {energy.map(f => <circle key={f.time} cx={x(f.day)} cy={yE(f.energia)} r="4.5" className="chart-dot" />)}
              <text x={padL} y={H - 6} className="chart-label">{formatDate(start)}</text>
              <text x={W - padR} y={H - 6} textAnchor="end" className="chart-label">{formatDate(end)}</text>
            </svg>
            <p className="chart-caption">
              <span className="legend-dot energy" /> Energia 1–5 (vasen) · <span className="legend-dot index" /> Suoritusindeksi % (oikea), {WEEKS} viikkoa
            </p>
          </>
        )}

        <div className="history-list">
          {recent.map(r => (
            <div key={r.day} className="feedback-row">
              <div className="feedback-row-head">
                <span className="history-date">{formatDate(r.day)}</span>
                <span>
                  {r.fb ? `energia ${r.fb.energia ?? '–'} · uni ${r.fb.uni ?? '–'} · ${r.fb.tuntuma || '–'}` : 'ei palautetta'}
                </span>
                <span className="feedback-index">{r.index === null ? '–' : `${sign(r.index)} %`}</span>
              </div>
              {r.fb && r.fb.tuntemukset.length > 0 && <div className="feedback-sub">{r.fb.tuntemukset.join(', ')}</div>}
              {r.fb && r.fb.muistiinpano && <div className="feedback-sub">📝 {r.fb.muistiinpano}</div>}
            </div>
          ))}
        </div>
        <p className="chart-caption">
          {loading ? 'Päivitetään… · ' : ''}Indeksi = liikkeiden parhaan sarjan arvioidun maksimin muutoksen mediaani edelliseen kertaan.
        </p>
      </div>
    </div>
  );
}
