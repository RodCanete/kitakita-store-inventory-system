import React from 'react';
import '../App.css';
import logo from '../images/app_logo.png';
import googleIcon from '../images/google_icon.png';

export default function Login({onSwitchToSignup, onAuthSuccess}) {
  const [email, setEmail] = React.useState(() => {
    // Load saved email if "Remember me" was checked
    const savedEmail = localStorage.getItem('kitakita_remembered_email');
    const rememberMe = localStorage.getItem('kitakita_remember_me') === 'true';
    return rememberMe && savedEmail ? savedEmail : '';
  });
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(() => {
    // Load "Remember me" preference
    return localStorage.getItem('kitakita_remember_me') === 'true';
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = `${apiBase}/api/auth/login`;
    console.log('Login attempt to:', apiUrl);
    console.log('API Base URL:', apiBase);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const ct = res.headers.get('content-type') || '';
      let payload;
      if (ct.includes('application/json')) {
        payload = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Unexpected response (status ${res.status})`);
      }

      if (!res.ok) throw new Error(payload?.error || payload?.message || 'Login failed');
      // payload structure: { token, userId, email, fullName, role, createdAt, lastLogin }
      
      // Save email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('kitakita_remembered_email', email);
        localStorage.setItem('kitakita_remember_me', 'true');
      } else {
        // Clear saved email if "Remember me" is unchecked
        localStorage.removeItem('kitakita_remembered_email');
        localStorage.setItem('kitakita_remember_me', 'false');
      }
      
      // Construct user object from payload
      const userObj = {
        id: payload.userId,
        userId: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        createdAt: payload.createdAt,
        lastLogin: payload.lastLogin
      };
      
      if (onAuthSuccess) onAuthSuccess(payload.token, userObj);
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle network errors (Failed to fetch)
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError(`Cannot connect to backend server at ${apiBase}. Please ensure:
        1. Backend is running on ${apiBase}
        2. CORS is enabled in backend
        3. Check browser console for details`);
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
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
          <h2>Log in to your account</h2>
          <p className="muted">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} aria-label="Login form">
            <div className="field">
              <label htmlFor="email" className="input-label">Email</label>
              <input id="email" name="email" className="input" placeholder="Enter your email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="password-input-wrapper">
                <input 
                  id="password" 
                  name="password" 
                  className="input" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                /> Remember me
              </label>
              <button type="button" className="link-button small-link">Forgot password</button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>

            <div className="divider"><span>or</span></div>

            <button type="button" className="btn-google">
              <img src={googleIcon} alt="Google" className="g-icon" />
              Sign in with Google
            </button>
          </form>

          <p className="footer-text">Don't have an account? <button className="link-button" onClick={onSwitchToSignup}>Sign up</button></p>
        </div>
      </div>
    </div>
  );
}