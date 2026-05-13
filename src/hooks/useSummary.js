import { useMemo } from 'react';
import { useForm } from '../context/FormContext';

export default function useSummary() {
  const { state } = useForm();

  return useMemo(() => {
    // Encontrar todas las respuestas que terminan en _score
    const scores = [];
    Object.entries(state.respuestas).forEach(([key, value]) => {
      if (key.endsWith('_score') && value) {
        // Extraer el nombre del dominio del key
        const domainSlug = key.replace('_score', '');
        scores.push({ domain: domainSlug, value: Number(value) });
      }
    });

    if (!scores.length) {
      return {
        average: null,
        lowDomains: [],
        highDomains: []
      };
    }

    const average = (scores.reduce((a, b) => a + b.value, 0) / scores.length).toFixed(1);

    const sorted = [...scores].sort((a, b) => a.value - b.value);
    const lowDomains = sorted.slice(0, 4).map((s) => ({
      domain: formatDomain(s.domain),
      value: s.value
    }));
    const highDomains = sorted.slice(-4).reverse().map((s) => ({
      domain: formatDomain(s.domain),
      value: s.value
    }));

    return { average, lowDomains, highDomains };
  }, [state.respuestas]);
}

function formatDomain(slug) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
