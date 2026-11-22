import React from 'react';
import { StatusIndicator } from '../common/StatusIndicator.jsx';
import { Button } from '../common/Button.jsx';

/**
 * Recent Service Alerts Table Component
 */
export function RecentAlerts({ alerts = [], onViewAll }) {
  return (
    <div className="ui-card">
      <div className="ui-card-header">
        <div>
          <div className="ui-card-title">Recent Service Incidents</div>
          <div className="ui-card-subtitle">Active corridor alerts requiring passenger or dispatch attention.</div>
        </div>
        {onViewAll && (
          <Button variant="secondary" size="sm" onClick={onViewAll}>
            View All Alerts
          </Button>
        )}
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Corridor</th>
              <th>Severity</th>
              <th>Reported</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.slice(0, 3).map((alert) => (
              <tr key={alert.id}>
                <td style={{ fontWeight: 600 }}>{alert.type}</td>
                <td>{alert.corridor}</td>
                <td>
                  <StatusIndicator
                    status={alert.severity}
                    type={alert.severityClass}
                  />
                </td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{alert.reportedTime}</td>
                <td>
                  <StatusIndicator
                    status={alert.status}
                    type={alert.status === 'Active' ? 'warning' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
