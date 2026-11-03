import React from 'react';
import { formatDate } from './stats.js';

// Kehityskäyrä yhdelle liikkeelle: suurin paino per kerta (tai toistot kehonpainoliikkeissä).
// `progress` tulee stats.js:n getProgress-funktiosta.
export default function ProgressChart({ name, progress, onClose }) {
  const sessions = progress.slice(-15);
  const bodyweight = sessions.length > 0 && sessions.every(s => s.top <= 1);
  const values = sessions.map(s =>
    bodyweight ? Math.max(...s.allSets.map(x => x.reps)) : s.top
  );
  const unit = bodyweight ? 'toistoa' : 'kg';

  const W = 320, H = 170, padL = 34, padR = 10, padT = 14, padB = 26;
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || Math.max(1, max * 0.1);
  const lo = min - span * 0.15;
  const hi = max + span * 0.15;
  const x = (i) => padL + (sessions.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (sessions.length - 1));
  const y = (v) => padT + (H - padT - padB) * (1 - (v - lo) / (hi - lo));
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const fmt = (n) => String(parseFloat(Number(n).toFixed(1)));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="exercise-card modal-card" onClick={e => e.stopPropagation()}>
        <div className="exercise-header">
          <h2 className="exercise-title" style={{ flex: 1 }}>{name}</h2>
          <button className="swap-action-btn" onClick={onClose}>SULJE</button>
        </div>

        {sessions.length === 0 ? (
          <p className="chart-empty">Tälle liikkeelle ei ole vielä historiaa.</p>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="progress-chart" role="img"
              aria-label={`${name}: ${bodyweight ? 'toistot' : 'paino'} viimeisillä kerroilla`}>
              {[min, max].filter((v, i, a) => a.indexOf(v) === i).map(v => (
                <g key={v}>
                  <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="chart-grid" />
                  <text x={padL - 6} y={y(v) + 4} textAnchor="end" className="chart-label">{fmt(v)}</text>
                </g>
              ))}
              <polyline points={points} className="chart-line" />
              {values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r="4.5" className="chart-dot" />
              ))}
              <text x={x(0)} y={H - 6} textAnchor="start" className="chart-label">{formatDate(sessions[0].time)}</text>
              {sessions.length > 1 && (
                <text x={x(sessions.length - 1)} y={H - 6} textAnchor="end" className="chart-label">
                  {formatDate(sessions[sessions.length - 1].time)}
                </text>
              )}
            </svg>
            <p className="chart-caption">
              {bodyweight ? 'Parhaan sarjan toistot' : 'Suurin paino'} viimeisillä {sessions.length} kerralla ({unit})
            </p>

            <div className="history-list">
              {sessions.slice(-6).reverse().map((s, i) => (
                <div key={i} className="history-row">
                  <span className="history-date">{formatDate(s.time)}</span>
                  <span>
                    {bodyweight
                      ? `${s.allSets.map(x => fmt(x.reps)).join(' / ')} toistoa`
                      : `${fmt(s.top)} kg × ${s.reps.map(fmt).join(' / ')}`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
