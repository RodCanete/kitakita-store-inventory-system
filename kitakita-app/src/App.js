import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup' or 'dashboard'
  const [token, setToken] = useState(() => localStorage.getItem('kitakita_token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('kitakita_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  const apiBase = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    // if token exists but no user, try to fetch /api/auth/me
    if (token && !user) {
      (async () => {
        try {
          const res = await fetch(`${apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const ct = res.headers.get('content-type') || '';
          let profile;
          if (ct.includes('application/json')) {
            profile = await res.json();
          } else {
            const text = await res.text();
            throw new Error(text || `Unexpected response (status ${res.status})`);
          }

          if (!res.ok) throw new Error('Could not fetch user');
          setUser(profile);
          localStorage.setItem('kitakita_user', JSON.stringify(profile));
          setMode('dashboard');
        } catch (e) {
          console.warn('Failed to fetch profile', e);
          setToken(null);
          localStorage.removeItem('kitakita_token');
          localStorage.removeItem('kitakita_user');
        }
      })();
    } else if (token && user) {
      setMode('dashboard');
    }
  }, [token, user, apiBase]);

  const handleAuthSuccess = (newToken, userObj) => {
    setToken(newToken);
    setUser(userObj);
    localStorage.setItem('kitakita_token', newToken);
    localStorage.setItem('kitakita_user', JSON.stringify(userObj));
    setMode('dashboard');
  };

  const handleLogout = async () => {
    if (!token) return;
    try {
      await fetch(`${apiBase}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('kitakita_token');
    localStorage.removeItem('kitakita_user');
    setMode('login');
  };

  return (
    <div className="App">
      {mode === 'login' && (
        <Login onSwitchToSignup={() => setMode('signup')} onAuthSuccess={handleAuthSuccess} />
      )}

      {mode === 'signup' && (
        <Signup onSwitchToLogin={() => setMode('login')} onAuthSuccess={handleAuthSuccess} />
      )}

      {mode === 'dashboard' && user && (
        <main style={{padding:40}}>
          <div style={{maxWidth:900, margin:'0 auto'}}>
            <h2>Welcome, {user.fullName || user.email}</h2>
            <p>Your email: {user.email}</p>
            <button className="btn-primary" onClick={handleLogout}>Log out</button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
