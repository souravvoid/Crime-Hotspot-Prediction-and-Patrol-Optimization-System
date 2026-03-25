import React, { useState, useEffect } from 'react';
import { getHotspots, getHotspotNeighbors, computeHotspots } from '../api';
import { Flame, Activity, AlertTriangle, GitMerge, RefreshCw, Search } from 'lucide-react';

const getBadge = (level) => {
  if (level === 'High Risk') return 'badge-high';
  if (level === 'Moderate Risk') return 'badge-medium';
  return 'badge-low';
};

const barFill = (level) => {
  if (level === 'High Risk') return 'high';
  if (level === 'Moderate Risk') return 'moderate';
  return 'low';
};

export default function HotspotAnalysis() {
  const [hotspots, setHotspots] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [depth, setDepth] = useState(1);
  const [neighbors, setNeighbors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);

  const load = () => getHotspots().then(res => setHotspots(res.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleRecompute = async () => {
    setComputing(true);
    await computeHotspots();
    load();
    setComputing(false);
  };

  const handleBfs = async () => {
    if (!selectedAreaId) return;
    setLoading(true);
    setNeighbors([]);
    try {
      const res = await getHotspotNeighbors(selectedAreaId, depth);
      setNeighbors(res.data.neighbors || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Hotspot Intelligence</h1>
          <p className="page-subtitle">Rule-based risk rankings and BFS graph clustering for crime spill-over detection.</p>
        </div>
        <button className="btn btn-ghost" onClick={handleRecompute} disabled={computing}>
          {computing ? <span className="spinner" /> : <RefreshCw size={15} />}
          Recompute Scores
        </button>
      </div>

      <div className="two-col">
        {/* Risk Rankings table */}
        <div className="glass-card">
          <div className="section-header">
            <div className="section-title"><Activity size={17} /> Risk Rankings</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hotspots.length} zones</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Zone</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Bar</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      No data — click Recompute Scores.
                    </td>
                  </tr>
                ) : hotspots.map((h, i) => (
                  <tr key={h.hotspot_id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.area_name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {h.hotspot_score != null ? h.hotspot_score.toFixed(2) : '—'}
                    </td>
                    <td><span className={`badge ${getBadge(h.risk_level)}`}>{h.risk_level}</span></td>
                    <td style={{ width: '100px' }}>
                      <div className="score-bar-track">
                        <div
                          className={`score-bar-fill ${barFill(h.risk_level)}`}
                          style={{ width: `${Math.min(100, (h.hotspot_score / 10) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BFS scanner */}
        <div className="glass-card">
          <div className="section-header">
            <div className="section-title"><GitMerge size={17} /> BFS Vulnerability Scanner</div>
            <span className="badge badge-blue">Graph Traversal</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '20px', lineHeight: '1.6' }}>
            Select a high-risk zone and run BFS to discover contiguous neighboring areas at risk of crime spill-over.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label>Target Zone</label>
              <select value={selectedAreaId} onChange={e => setSelectedAreaId(e.target.value)}>
                <option value="">— Select an area —</option>
                {hotspots.map(h => (
                  <option key={h.area_id} value={h.area_id}>{h.area_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>BFS Depth</label>
              <select value={depth} onChange={e => setDepth(Number(e.target.value))}>
                <option value={1}>Depth 1 — Direct neighbors</option>
                <option value={2}>Depth 2 — Extended cluster</option>
                <option value={3}>Depth 3 — Wide radius</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleBfs}
              disabled={!selectedAreaId || loading}
            >
              {loading ? <span className="spinner" /> : <Search size={16} />}
              {loading ? 'Traversing graph...' : 'Run BFS Analysis'}
            </button>
          </div>

          {neighbors.length > 0 && (
            <div className="bfs-result">
              <h3>
                <AlertTriangle size={15} />
                {neighbors.length} Neighboring Zone{neighbors.length !== 1 ? 's' : ''} at Risk
              </h3>
              {neighbors.map(n => (
                <div key={n.area_id} className="bfs-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Flame size={14} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontWeight: 500 }}>{n.area_name}</span>
                  </div>
                  <span className="bfs-dist">dist: {n.distance}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && neighbors.length === 0 && selectedAreaId && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '16px' }}>
              No neighboring zones found at this depth.
            </p>
          )}
        </div>
      </div>

      {/* Algorithm note */}
      <div className="glass-card" style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Algorithm
            </div>
            <span className="badge badge-blue">BFS — O(V+E)</span>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Risk Thresholds
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-high">≥ 7.0 High</span>
              <span className="badge badge-medium">≥ 4.0 Moderate</span>
              <span className="badge badge-low">&lt; 4.0 Low</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Data Source
            </div>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>SQLite · SQLAlchemy ORM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
