import React, { useState } from 'react';
import { FEEDBACK_FEELINGS, FEEDBACK_TAGS, hasFeedback } from './feedback.js';

// Treenin jälkeinen palauteikkuna. Ohitettavissa: OHITA tallentaa pelkän treenin.
// onSubmit(palaute | null) tallentaa treenin; onCancel palaa takaisin treeniin.
export default function FeedbackDialog({ onSubmit, onCancel, saving }) {
  const [f, setF] = useState({ energia: 0, uni: 0, tuntuma: '', tuntemukset: [], muistiinpano: '' });
  const set = (patch) => setF(p => ({ ...p, ...patch }));
  const toggle = (key, value) => set({ [key]: f[key] === value ? (typeof value === 'number' ? 0 : '') : value });
  const toggleTag = (t) => set({ tuntemukset: f.tuntemukset.includes(t) ? f.tuntemukset.filter(x => x !== t) : [...f.tuntemukset, t] });

  const rating = (key) => (
    <div className="chip-row">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" className={`chip${f[key] === n ? ' on' : ''}`} onClick={() => toggle(key, n)}>{n}</button>
      ))}
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="exercise-card modal-card">
        <h2 className="exercise-title">Miltä treeni tuntui?</h2>

        <div className="feedback-field"><span>Energia (1–5)</span>{rating('energia')}</div>
        <div className="feedback-field"><span>Uni (1–5)</span>{rating('uni')}</div>
        <div className="feedback-field">
          <span>Tuntuma</span>
          <div className="chip-row">
            {FEEDBACK_FEELINGS.map(t => (
              <button key={t} type="button" className={`chip wide${f.tuntuma === t ? ' on' : ''}`} onClick={() => toggle('tuntuma', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="feedback-field">
          <span>Tuntemukset</span>
          <div className="chip-row wrap">
            {FEEDBACK_TAGS.map(t => (
              <button key={t} type="button" className={`chip wide${f.tuntemukset.includes(t) ? ' on' : ''}`} onClick={() => toggleTag(t)}>{t}</button>
            ))}
          </div>
        </div>
        <input
          type="text"
          className="note-input"
          placeholder="Muuta (esim. kävelyt, huonot yöt)"
          value={f.muistiinpano}
          onChange={e => set({ muistiinpano: e.target.value })}
        />

        <button className="main-save-btn" style={{ marginBottom: 0 }} disabled={saving}
          onClick={() => onSubmit(hasFeedback(f) ? f : null)}>
          {saving ? 'TALLENNETAAN…' : 'TALLENNA'}
        </button>
        <button className="add-set-pill" disabled={saving} onClick={() => onSubmit(null)}>OHITA PALAUTE</button>
        <button className="cancel-btn" style={{ position: 'static', width: '100%' }} disabled={saving} onClick={onCancel}>TAKAISIN TREENIIN</button>
      </div>
    </div>
  );
}
