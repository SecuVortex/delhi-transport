import React from 'react';

/**
 * Standard Page Layout Shell
 * Enforces consistent heading hierarchy, subtitles, action bar, and spacing.
 */
export function PageLayout({ title, subtitle, actions, children }) {
  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{actions}</div>}
      </div>
      {children}
    </section>
  );
}
