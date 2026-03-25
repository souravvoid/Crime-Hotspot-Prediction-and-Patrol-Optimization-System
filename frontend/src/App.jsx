import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileWarning, Flame, Radio } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CrimeEntry from './components/CrimeEntry';
import HotspotAnalysis from './components/HotspotAnalysis';
import PatrolAllocation from './components/PatrolAllocation';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Shield size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-name">OptiPatrol</span>
              <span className="brand-sub">Crime Analytics</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-section-label">Navigation</span>

            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} className="nav-icon" />
              Dashboard
              <span className="nav-dot" />
            </NavLink>

            <NavLink to="/add-crime" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileWarning size={18} className="nav-icon" />
              Log Incident
              <span className="nav-dot" />
            </NavLink>

            <NavLink to="/hotspots" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Flame size={18} className="nav-icon" />
              Hotspot Analysis
              <span className="nav-dot" />
            </NavLink>

            <NavLink to="/patrols" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Radio size={18} className="nav-icon" />
              Patrol Dispatch
              <span className="nav-dot" />
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span className="live-dot">System Online</span>
            <div style={{ marginTop: '8px', fontSize: '0.7rem' }}>
              Backend API: localhost:8000
            </div>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-crime" element={<CrimeEntry />} />
            <Route path="/hotspots" element={<HotspotAnalysis />} />
            <Route path="/patrols" element={<PatrolAllocation />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
