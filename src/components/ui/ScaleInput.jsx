import { useState } from 'react';
import './ScaleInput.css';

export default function ScaleInput({ name, domain, value, onChange, disabled }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={`scale-input ${disabled ? 'disabled' : ''}`}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
        <label
          key={num}
          className={`scale-option ${value === String(num) ? 'active' : ''} ${hovered && num <= hovered ? 'hovered' : ''}`}
          onMouseEnter={() => !disabled ? setHovered(num) : null}
          onMouseLeave={() => !disabled ? setHovered(null) : null}
        >
          <input
            type="radio"
            name={name}
            value={String(num)}
            checked={value === String(num)}
            onChange={(e) => onChange(name, e.target.value, domain)}
            data-scale="true"
            data-domain={domain}
            disabled={disabled}
          />
          <span>{num}</span>
        </label>
      ))}
    </div>
  );
}
