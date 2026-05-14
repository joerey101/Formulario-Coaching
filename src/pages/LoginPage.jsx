import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

import Button from '../components/ui/Button';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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
        navigate('/');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
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

        <div className="login-footer">
          <p>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿Sos nuevo?'}
            <button onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
