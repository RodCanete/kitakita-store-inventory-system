import React from 'react';
import '../App.css';
import logo from '../images/app_logo.png';
import googleIcon from '../images/google_icon.png';

export default function Signup({ onSwitchToLogin, onAuthSuccess }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 🔐 Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const apiUrl = `${apiBase}/api/auth/signup`;
    console.log('Signup attempt to:', apiUrl);

    try {
      const res = await fetch(apiUrl, {
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

      if (!res.ok) {
        const errorMessage = payload?.message || payload?.error || `Signup failed (${res.status})`;
        throw new Error(errorMessage);
      }

      const user = {
        id: payload.userId,
        userId: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        createdAt: payload.createdAt,
        lastLogin: payload.lastLogin
      };

      if (onAuthSuccess) onAuthSuccess(payload.token, user);
    } catch (err) {
      console.error('Signup error:', err);

      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError(`Cannot connect to backend server at ${apiBase}. Please ensure:
        1. Backend is running on ${apiBase}
        2. CORS is enabled in backend
        3. Check browser console for details`);
      } else {
        setError(err.message || 'Signup failed. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-wrap">
          <img src={logo} alt="Kita Kita" className="brand-logo" />
        </div>
      </div>

      <div className="auth-right">
        <div className="form-card">
          <img src={logo} alt="logo small" className="brand-small" />
          <h2 className="form-title">Create your account</h2>
          <p className="muted">Provide your email and choose a password to get started.</p>

          <form onSubmit={handleSubmit} aria-label="Signup form">
            <div className="field">
              <label htmlFor="name" className="input-label">Full name</label>
              <input
                id="name"
                name="name"
                className="input"
                placeholder="Your full name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                name="email"
                className="input"
                placeholder="Enter your email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                name="password"
                className="input"
                type="password"
                placeholder="Create password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {/* 🔐 Confirm Password */}
            <div className="field">
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="input"
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>

            <div className="divider"><span>or</span></div>

            <button type="button" className="btn-google">
              <img src={googleIcon} alt="Google" className="g-icon" />
              Sign up with Google
            </button>
          </form>

          <p className="footer-text">
            Already have an account?
            <button className="link-button" onClick={onSwitchToLogin}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
