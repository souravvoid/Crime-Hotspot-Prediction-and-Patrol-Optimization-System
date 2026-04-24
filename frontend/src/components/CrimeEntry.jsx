import React, { useState, useEffect } from 'react';
import { getAreas, createCrime, computeHotspots } from '../api';
import { FileWarning, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const CRIME_TYPES = ['Robbery', 'Theft', 'Assault', 'Vandalism', 'Burglary', 'Pickpocketing', 'Other'];
const SEVERITY_OPTS = ['High', 'Medium', 'Low'];
const TIME_SLOTS = ['Day', 'Evening', 'Night'];
const STATUS_OPTS = ['Open', 'Under Investigation', 'Resolved'];

export default function CrimeEntry() {
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    area_id: '',
    crime_type: 'Robbery',
    severity: 'Medium',
    crime_date: new Date().toISOString().split('T')[0],
    crime_time: '12:00',
    time_slot: 'Day',
    status: 'Open',
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    getAreas().then(res => setAreas(res.data)).catch(console.error);
  }, []);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCrime({ ...formData, area_id: Number(formData.area_id) });
      await computeHotspots();
      setAlert({ type: 'success', msg: 'Incident logged! Hotspot scores recomputed automatically.' });
      setFormData(prev => ({ ...prev, crime_type: 'Robbery', severity: 'Medium', area_id: '' }));
    } catch {
      setAlert({ type: 'error', msg: 'Submission failed. Check backend connection.' });
    }
    setSubmitting(false);
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Log Incident</h1>
        <p className="page-subtitle">Submit a new crime record — hotspot scores update automatically.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>
        {/* Form */}
        <div className="glass-card">
          <div className="section-header">
            <div className="section-title"><FileWarning size={17} /> Incident Details</div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="area_id">Location (Area) <span className="text-red-500" style={{color: 'var(--danger)'}}>*</span></label>
              <select id="area_id" value={formData.area_id} onChange={set('area_id')} required>
                <option value="">— Select area —</option>
                {areas.map(a => (
                  <option key={a.area_id} value={a.area_id}>{a.area_name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crime_type">Crime Type</label>
                <select id="crime_type" value={formData.crime_type} onChange={set('crime_type')}>
                  {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="severity">Severity Level</label>
                <select id="severity" value={formData.severity} onChange={set('severity')}>
                  {SEVERITY_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crime_date">Date <span className="text-red-500" style={{color: 'var(--danger)'}}>*</span></label>
                <input id="crime_date" type="date" value={formData.crime_date} onChange={set('crime_date')} required />
              </div>
              <div className="form-group">
                <label htmlFor="crime_time">Time <span className="text-red-500" style={{color: 'var(--danger)'}}>*</span></label>
                <input id="crime_time" type="time" value={formData.crime_time} onChange={set('crime_time')} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time_slot">Time Slot</label>
                <select id="time_slot" value={formData.time_slot} onChange={set('time_slot')}>
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" value={formData.status} onChange={set('status')}>
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : <Zap size={16} />}
              {submitting ? 'Submitting...' : 'Submit to Engine'}
            </button>
          </form>
        </div>

        {/* Info sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
              <Zap size={15} /> How It Works
            </div>
            <ol style={{ paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '2' }}>
              <li>Select the location and crime details</li>
              <li>Data is stored in the SQLite DB</li>
              <li>Scoring formula auto-runs on submit</li>
              <li>Hotspot map updates instantly</li>
            </ol>
          </div>

          <div className="glass-card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
              Scoring Formula
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.78rem',
              color: 'var(--accent)',
              background: 'rgba(79,142,247,0.07)',
              padding: '14px',
              borderRadius: '8px',
              lineHeight: '1.8',
              border: '1px solid var(--accent-dim)',
            }}>
              Score =<br />&nbsp;&nbsp;freq × 0.5<br />&nbsp;&nbsp;+ severity × 0.3<br />&nbsp;&nbsp;+ night_rate × 0.2
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              High Risk: ≥ 7.0 | Moderate: ≥ 4.0 | Low: &lt; 4.0
            </p>
          </div>

          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {[['High', 'badge-high'], ['Medium', 'badge-medium'], ['Low', 'badge-low']].map(([s, c]) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Severity: {s}</span>
                  <span className={`badge ${c}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
