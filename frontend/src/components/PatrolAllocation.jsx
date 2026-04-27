import React, { useState, useEffect } from 'react';
import { getPatrolAssignments, assignPatrols, getHotspots } from '../api';
import { Radio, CheckCircle2, Zap, Info, Clock } from 'lucide-react';

const getPriorityBadge = (level) => {
  if (level === 'High') return 'badge-high';
  if (level === 'Medium') return 'badge-medium';
  return 'badge-low';
};

export default function PatrolAllocation() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const fetchAssignments = async () => {
    try {
      const [assignRes, hotspotRes] = await Promise.all([getPatrolAssignments(), getHotspots()]);
      const hs = hotspotRes.data;
      const mapped = assignRes.data.map(a => ({
        ...a,
        area_name: hs.find(h => h.area_id === a.area_id)?.area_name || 'Unknown',
      }));
      setAssignments(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleGreedyDispatch = async () => {
    setLoading(true);
    try {
      const res = await assignPatrols();
      // The response may contain assignment objects with area_id; enrich with name
      const hotspotRes = await getHotspots();
      const hs = hotspotRes.data;
      const raw = res.data.assignments || [];
      const mapped = raw.map(a => ({
        ...a,
        area_name: hs.find(h => h.area_id === a.area_id)?.area_name || a.area_name || 'Unknown',
      }));
      setAssignments(mapped);
      setLastRun(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Patrol Dispatch</h1>
          <p className="page-subtitle">Greedy optimization assigns patrol units to maximum-risk zones first.</p>
        </div>
        <button className="btn btn-success" onClick={handleGreedyDispatch} disabled={loading} style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
          {loading ? <span className="spinner" /> : <Zap size={16} />}
          {loading ? 'Running Algorithm...' : 'Run Greedy Dispatch'}
        </button>
      </div>

      {/* Algorithm card */}
      <div className="glass-card" style={{ marginBottom: '28px', borderColor: 'rgba(61,214,140,0.15)' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Algorithm</div>
            <span className="badge badge-low">Greedy — O(n log n)</span>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Strategy</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort hotspots by risk ↓ · assign available unit · repeat</span>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Guarantee</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Highest-risk zones always served first</span>
          </div>
          {lastRun && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Clock size={13} /> Last run: {lastRun}
            </div>
          )}
        </div>
      </div>

      {/* Assignments */}
      {assignments.length > 0 ? (
        <div className="glass-card">
          <div className="section-header">
            <div className="section-title">
              <Radio size={17} /> Active Dispatches
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="live-dot">Live</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{assignments.length} units deployed</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Assigned Zone</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignment ID</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px',
                          borderRadius: '8px',
                          background: 'var(--success-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Radio size={14} color="var(--success)" />
                        </div>
                        <span style={{ fontWeight: 600 }}>
                          {a.patrol_name || `Unit ${a.patrol_id}`}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{a.area_name}</td>
                    <td>
                      <span className={`badge ${getPriorityBadge(a.priority_level)}`}>
                        {a.priority_level} Priority
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 500 }}>
                        <CheckCircle2 size={15} /> En Route
                      </div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      #{a.assignment_id || i + 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <div className="empty-state">
            <Radio size={48} />
            <h3>No Dispatches Yet</h3>
            <p>Click "Run Greedy Dispatch" to deploy patrol units to the highest-risk zones.</p>
            <button className="btn btn-success" style={{ marginTop: '20px' }} onClick={handleGreedyDispatch} disabled={loading}>
              {loading ? <span className="spinner" /> : <Zap size={16} />} Deploy Now
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '18px 24px', display: 'flex', gap: '10px', alignItems: 'flex-start', borderColor: 'rgba(79,142,247,0.15)' }}>
        <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          The Greedy algorithm iterates over hotspots sorted by risk score (descending) and assigns the next available patrol unit to each. Once all units are exhausted, remaining zones are unserved — demonstrating resource-constrained optimization.
        </p>
      </div>
    </div>
  );
}
