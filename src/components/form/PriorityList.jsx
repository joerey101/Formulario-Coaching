import './PriorityList.css';

const PRIORITY_NAMES = [
  'Trabajo / profesión', 'Dinero', 'Salud', 'Cuerpo', 'Alimentación',
  'Hijos/as', 'Pareja', 'Familia', 'Amistades', 'Emociones',
  'Propósito', 'Espiritualidad', 'Hábitos', 'Tiempo', 'Descanso',
  'Límites', 'Miedos', 'Otra'
];

export default function PriorityList({ selected = [], onChange }) {
  const toggle = (item) => {
    const next = selected.includes(item)
      ? selected.filter((s) => s !== item)
      : [...selected, item];
    onChange('prioridades', next);
  };

  return (
    <div className="priority-list">
      {PRIORITY_NAMES.map((item) => (
        <label key={item} className={`priority-item ${selected.includes(item) ? 'checked' : ''}`}>
          <input
            type="checkbox"
            name="prioridades"
            value={item}
            checked={selected.includes(item)}
            onChange={() => toggle(item)}
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}
