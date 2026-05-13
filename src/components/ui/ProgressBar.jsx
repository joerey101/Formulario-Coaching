import './ProgressBar.css';

export default function ProgressBar({ percent }) {
  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>Avance de respuestas</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
