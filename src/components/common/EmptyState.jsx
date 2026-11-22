import React from 'react';

/**
 * Functional Empty State Component
 * Clean and professional, zero unnecessary decorative illustrations.
 */
export function EmptyState({ title = 'No results found', description = 'Try adjusting your search criteria or filters.' }) {
  return (
    <div
      style={{
        padding: '32px 20px',
        textAlign: 'center',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
        {title}
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>
        {description}
      </div>
    </div>
  );
}
