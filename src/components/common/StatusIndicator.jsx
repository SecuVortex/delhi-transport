import React from 'react';

/**
 * Functional Status Indicator Badge
 * Strictly non-decorative: communicates operational status only.
 */
export function StatusIndicator({ status, type = 'neutral', label, className = '' }) {
  const typeClass =
    type === 'success'
      ? 'status-pill success'
      : type === 'warning'
      ? 'status-pill warning'
      : type === 'error'
      ? 'status-pill error'
      : 'status-pill neutral';

  return (
    <span className={`${typeClass} ${className}`.trim()}>
      {label || status}
    </span>
  );
}
