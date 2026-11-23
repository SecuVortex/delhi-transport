import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { StatusIndicator } from '../components/common/StatusIndicator.jsx';
import { getTrafficAlerts } from '../services/trafficService.js';

/**
 * Service Alerts & Incidents Page Component
 * Connects directly to live traffic intelligence service and high-congestion stretches.
 */
export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    getTrafficAlerts()
      .then((data) => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.severity.toLowerCase() === filter.toLowerCase();
  });

  const severeCount = alerts.filter((a) => a.severity.toLowerCase() === 'severe').length;
  const moderateCount = alerts.filter((a) => a.severity.toLowerCase() === 'moderate').length;
  const advisoryCount = alerts.filter((a) => a.severity.toLowerCase() === 'advisory').length;

  return (
    <PageLayout
      title="Service Alerts & Incidents"
      subtitle="Track road closures, construction detours, weather conditions, and transit delays."
      actions={
        <Button variant="secondary" size="sm" onClick={fetchAlerts} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Alerts'}
        </Button>
      }
    >
      {/* Tab Filter Bar */}
      <div className="alerts-filter-bar">
        <div className="tab-nav">
          <button
            type="button"
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Incidents ({alerts.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'severe' ? 'active' : ''}`}
            onClick={() => setFilter('severe')}
          >
            Severe ({severeCount})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'moderate' ? 'active' : ''}`}
            onClick={() => setFilter('moderate')}
          >
            Moderate ({moderateCount})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'advisory' ? 'active' : ''}`}
            onClick={() => setFilter('advisory')}
          >
            Advisories ({advisoryCount})
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="ui-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert Type</th>
                <th>Location</th>
                <th>Affected Corridors</th>
                <th>Severity</th>
                <th>Reported Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td style={{ fontWeight: 600 }}>{alert.type}</td>
                    <td>{alert.corridor}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {alert.affectedRoutes.map((r) => (
                          <span key={r} className="bus-tag">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <StatusIndicator status={alert.severity} type={alert.severityClass} />
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{alert.reportedTime}</td>
                    <td>
                      <StatusIndicator
                        status={alert.status}
                        type={alert.status === 'Active' ? 'warning' : 'neutral'}
                      />
                    </td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => setActiveAlert(alert)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                    {loading ? 'Checking for active corridor disruptions...' : 'No active disruptions reported on monitored corridors.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details Modal */}
      <Modal
        isOpen={Boolean(activeAlert)}
        onClose={() => setActiveAlert(null)}
        title={activeAlert ? `${activeAlert.type}: ${activeAlert.corridor}` : 'Incident Details'}
        footer={
          <Button variant="secondary" onClick={() => setActiveAlert(null)}>
            Dismiss
          </Button>
        }
      >
        {activeAlert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusIndicator status={`${activeAlert.severity} Severity`} type={activeAlert.severityClass} />
              <StatusIndicator status={activeAlert.status} type={activeAlert.status === 'Active' ? 'warning' : 'neutral'} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Reported {activeAlert.reportedTime}
              </span>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Disruption Summary</div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {activeAlert.description}
              </p>
            </div>

            <div style={{ background: 'var(--color-surface-muted)', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--color-text)', marginBottom: '2px' }}>
                Transit Impact
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{activeAlert.impact}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Affected Corridors</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{activeAlert.affectedRoutes.join(', ')}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Expected Clearance</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{activeAlert.expectedClearance}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
