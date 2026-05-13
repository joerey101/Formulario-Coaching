import './LandingPage.css';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo-placeholder">CONSCIENCIA HUMANA</div>
      </header>
      
      <main className="landing-hero">
        <div className="card hero-card">
          <h1>Hacia una vida consciente</h1>
          <p>Explorando los límites del ser, la autoobservación y el diseño de nuestro propósito real.</p>
          <div className="cta-group">
            <Link to="/formulariocoaching" className="btn-landing">
              Comenzar Autoobservación 360°
            </Link>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2026 Consciencia Humana · Espacio de evolución personal</p>
      </footer>
    </div>
  );
}
