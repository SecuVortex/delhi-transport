import React from 'react';

/**
 * Standard Page Layout Shell
 * Enforces responsive heading hierarchy, scannable subtitles, flexible action bar, and clean spacing.
 */
export function PageLayout({ title, subtitle, actions, children }) {
  return (
    <section className="page-container">
      <div className="page-header">
        <div className="page-header-title-group" style={{ minWidth: 0 }}>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
