import React, { useState, useEffect } from 'react';
import { getHotspots, getCrimes, getPatrolAssignments, computeHotspots } from '../api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import {
  BarChart2, AlertTriangle, Radio, RefreshCw,
  TrendingUp, Clock
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const riskColor = (level) => {
  if (level === 'High Risk') return 'var(--danger)';
  if (level === 'Moderate Risk') return 'var(--warning)';
  return 'var(--success)';
};

const barFillClass = (level) => {
  if (level === 'High Risk') return 'high';
  if (level === 'Moderate Risk') return 'moderate';
  return 'low';
};

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCrimes: 0, highRiskZones: 0, activePatrols: 0 });
  const [hotspots, setHotspots] = useState([]);
  const [crimes, setCrimes] = useState([]);
  const [recomputing, setRecomputing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = () => {
    Promise.all([getCrimes(), getHotspots(), getPatrolAssignments()])
      .then(([crimesRes, hotspotsRes, patrolsRes]) => {
        const cr = crimesRes.data;
        const hs = hotspotsRes.data;
        const pa = patrolsRes.data;
        setStats({
          totalCrimes: cr.length,
          highRiskZones: hs.filter(s => s.risk_level === 'High Risk').length,
          activePatrols: pa.length,
        });
        setHotspots(hs.slice(0, 7));
        setCrimes(cr);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    await computeHotspots();
    loadData();
    setRecomputing(false);
  };

  // Bar chart — risk scores
  const barData = {
    labels: hotspots.map(h => h.area_name),
    datasets: [{
      label: 'Risk Score',
      data: hotspots.map(h => h.hotspot_score),
      backgroundColor: hotspots.map(h =>
        h.risk_level === 'High Risk' ? 'rgba(247,92,92,0.8)' :
        h.risk_level === 'Moderate Risk' ? 'rgba(247,185,85,0.8)' :
        'rgba(61,214,140,0.8)'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0e1628',
        titleColor: '#e8eaf0',
        bodyColor: '#7a8299',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#7a8299', font: { size: 11 } },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#e8eaf0', font: { size: 11 } },
        border: { display: false },
      }
    }
  };

  // Crime type distribution
  const typeCounts = crimes.reduce((acc, c) => {
    acc[c.crime_type] = (acc[c.crime_type] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(typeCounts),
    datasets: [{
      data: Object.values(typeCounts),
      backgroundColor: [
        'rgba(79,142,247,0.8)',
        'rgba(247,92,92,0.8)',
        'rgba(247,185,85,0.8)',
        'rgba(61,214,140,0.8)',
        'rgba(139,92,246,0.8)',
        'rgba(236,72,153,0.8)',
        'rgba(20,184,166,0.8)',
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#7a8299', boxWidth: 12, padding: 14, font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0e1628',
        titleColor: '#e8eaf0',
        bodyColor: '#7a8299',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
      }
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">City Crime Dashboard</h1>
          <p className="page-subtitle">Algorithm-computed risk intelligence and patrol analytics.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} /> {lastUpdated}
            </span>
          )}
          <button className="btn btn-ghost" onClick={handleRecompute} disabled={recomputing}>
            {recomputing ? <span className="spinner" /> : <RefreshCw size={15} />}
            Recompute
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-icon blue"><BarChart2 size={20} /></div>
          <div className="stat-number blue">{stats.totalCrimes}</div>
          <div className="stat-label">Total Incidents</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={20} /></div>
          <div className="stat-number red">{stats.highRiskZones}</div>
          <div className="stat-label">High Risk Zones</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Radio size={20} /></div>
          <div className="stat-number green">{stats.activePatrols}</div>
          <div className="stat-label">Active Dispatches</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="two-col">
        <div className="chart-card">
          <div className="card-title"><TrendingUp size={18} /> Risk Score by Zone</div>
          <div style={{ height: '260px' }}>
            {hotspots.length > 0 ? <Bar data={barData} options={barOptions} /> : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Run hotspot computation first.</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="card-title"><BarChart2 size={18} /> Crime Type Distribution</div>
          <div style={{ height: '260px' }}>
            {crimes.length > 0 ? <Doughnut data={doughnutData} options={doughnutOptions} /> : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No crimes logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Zone risk list */}
      <div className="glass-card">
        <div className="section-header">
          <div className="section-title">
            <AlertTriangle size={17} /> Top Risk Zones
          </div>
          <span className="badge badge-blue">Rule-Based Scoring</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Zone</th>
                <th>Score</th>
                <th>Risk Level</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No hotspot data. Click Recompute.
                  </td>
                </tr>
              ) : hotspots.map((h, i) => (
                <tr key={h.hotspot_id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td style={{ fontWeight: '600' }}>{h.area_name}</td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', color: riskColor(h.risk_level) }}>
                      {h.hotspot_score != null ? h.hotspot_score.toFixed(2) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      h.risk_level === 'High Risk' ? 'badge-high' :
                      h.risk_level === 'Moderate Risk' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {h.risk_level}
                    </span>
                  </td>
                  <td style={{ width: '140px' }}>
                    <div className="score-bar-track">
                      <div
                        className={`score-bar-fill ${barFillClass(h.risk_level)}`}
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
    </div>
  );
}
