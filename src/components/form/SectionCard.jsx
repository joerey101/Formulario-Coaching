import { useState } from 'react';
import './SectionCard.css';

export default function SectionCard({ number, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`section-card card ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="section-summary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="section-title">
          <div className="section-number">{number}</div>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className={`chevron ${open ? 'rotated' : ''}`}>⌄</div>
      </button>
      {open && (
        <div className="section-questions">
          {children}
        </div>
      )}
    </div>
  );
}
