import './TextArea.css';

export default function TextArea({ name, label, helper, value, onChange }) {
  return (
    <div className="textarea-field">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder="Escribí tu respuesta..."
      />
      {helper && <p className="helper">{helper}</p>}
    </div>
  );
}
