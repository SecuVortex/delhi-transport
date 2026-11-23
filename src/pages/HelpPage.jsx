import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout.jsx';

/**
 * Help and Documentation Page Component
 */
export function HelpPage() {
  const [openFaq, setOpenFaq] = useState({ 0: true });

  const toggleFaq = (index) => {
    setOpenFaq((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    {
      q: 'How frequently is the bus position data refreshed?',
      a: 'Vehicle telemetry in this demonstration environment is refreshed every 4 seconds via simulated coordinate updates. In production deployments, data connects directly to municipal automated vehicle location (AVL) GTFS Realtime feeds.'
    },
    {
      q: 'What does the delay indicator (+3 min) represent?',
      a: 'The delay indicator compares the estimated arrival time with the scheduled timetable published in the general transit feed. Positive values indicate delay due to congestion, signal density, or detours.'
    },
    {
      q: 'How are walking connections calculated between bus stops?',
      a: 'Walking links use pedestrian street networks calibrated to a standard 4.5 km/h walking speed, incorporating pedestrian signals and step-free accessibility preferences where configured.'
    }
  ];

  return (
    <PageLayout
      title="Help & Documentation"
      subtitle="Platform guides, operational instructions, FAQ, and accessibility documentation."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="ui-card">
          <div className="ui-card-title">Quick Start Handbook</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>1. Planning a Journey:</strong> Enter origin and destination stations into the Journey Planner. The algorithm computes 3 prioritized alternatives factoring in walking distance, transfer wait times, and current corridor congestion.
            </div>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>2. Live Vehicle Tracking:</strong> The Live Map visualizes simulated real-time positions for all buses in service. Click any bus icon to open the telemetry inspector showing speed, next stop, and passenger occupancy.
            </div>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>3. Understanding Alerts:</strong> Incidents are categorized as Severe (service disruption), Moderate (corridor detours), or Advisory (minor platform adjustments).
            </div>
          </div>
        </div>

        <div className="ui-card">
          <div className="ui-card-title">Accessible Keyboard Shortcuts</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Focus Global Search</span>
              <kbd style={{ padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '4px', fontWeight: 600 }}>/</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Close Modal / Popover</span>
              <kbd style={{ padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '4px', fontWeight: 600 }}>Esc</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Skip to Content</span>
              <kbd style={{ padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '4px', fontWeight: 600 }}>Tab (Top)</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Simulated Feed Interval</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>4.0 seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="ui-card">
        <div className="ui-card-title">Frequently Asked Questions</div>

        <div className="help-faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = Boolean(openFaq[idx]);
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {isOpen && <div className="faq-content">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
