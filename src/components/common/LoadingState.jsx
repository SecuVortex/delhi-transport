import React from 'react';

/**
 * Accessible Loading Indicator Component
 */
export function LoadingState({ message = 'Loading transit data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        color: 'var(--color-text-secondary)',
        fontSize: '13px',
        gap: '8px'
      }}
      role="status"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
