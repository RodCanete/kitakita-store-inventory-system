import React from 'react';
import '../App.css';
import logo from '../images/app_logo.png';

export default function Signup({onSwitchToLogin, onAuthSuccess}) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const apiBase = process.env.REACT_APP_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password })
      });

      const ct = res.headers.get('content-type') || '';
      let payload;
      if (ct.includes('application/json')) {
        payload = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Unexpected response (status ${res.status})`);
      }

      if (!res.ok) throw new Error(payload?.error || payload?.message || 'Signup failed');
      if (onAuthSuccess) onAuthSuccess(payload.token, payload.user);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-wrap">
          <img src={logo} alt="Kita Kita" className="brand-logo" />
          <h1 className="brand-title">KITA KITA</h1>
        </div>
      </div>

      <div className="auth-right">
        <div className="form-card">
          <img src={logo} alt="logo small" className="brand-small" />
          <h2>Create your account</h2>
          <p className="muted">Provide your email and choose a password to get started.</p>

          <form onSubmit={handleSubmit} aria-label="Signup form">
            <div className="field">
              <label htmlFor="name" className="input-label">Full name</label>
              <input id="name" name="name" className="input" placeholder="Your full name" required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="email" className="input-label">Email</label>
              <input id="email" name="email" className="input" placeholder="Enter your email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="password" className="input-label">Password</label>
              <input id="password" name="password" className="input" type="password" placeholder="Create a password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating account…' : 'Sign up'}</button>

            <div className="divider"><span>or</span></div>

            <button type="button" className="btn-google">
              <span className="g-icon" aria-hidden>G</span>
              Sign up with Google
            </button>
          </form>

          <p className="footer-text">Already have an account? <button className="link-button" onClick={onSwitchToLogin}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
