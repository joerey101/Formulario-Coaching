import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import './LoginPage.css';

import Button from '../components/ui/Button';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();


  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert('¡Registro exitoso! Por favor verifica tu email o intenta ingresar.');
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        // El redirect lo maneja PublicOnlyRoute en App.jsx según el rol del usuario
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    const { error } = await resetPassword(resetEmail);
    if (error) {
      setResetMessage(`Error: ${error.message}`);
    } else {
      setResetMessage(
        'Te enviamos un mail con instrucciones para resetear tu contraseña. ' +
        'Revisá tu bandeja de entrada (y spam por las dudas).'
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="brand">
          <span className="brand-dot"></span>
          <span className="brand-text">CONSCIENCIA</span>
        </div>
        <h1>{isSignUp ? 'Crear cuenta' : 'Bienvenido'}</h1>
        <p className="subtitle">
          {isSignUp 
            ? 'Registrate para comenzar tu proceso de coaching' 
            : 'Ingresá para continuar con tus formularios'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="tu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Ingresar')}
          </Button>
        </form>

        <div className="reset-password-section">
          {!showResetForm ? (
            <button
              type="button"
              className="link-button"
              onClick={() => setShowResetForm(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          ) : (
            <form onSubmit={handleResetPassword} className="reset-form">
              <input
                type="email"
                placeholder="Tu email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary reset-btn">Enviar mail de recuperación</button>
              <button type="button" className="link-button cancel-btn" onClick={() => setShowResetForm(false)}>
                Cancelar
              </button>
              {resetMessage && <p className="reset-message">{resetMessage}</p>}
            </form>
          )}
        </div>

        <div className="login-footer">
          <p>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿Sos nuevo?'}
            <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-auth-btn">
              {isSignUp ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
