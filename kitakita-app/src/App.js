import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Sales from './components/Sales';

function App() {
  // Initialize state - check if we have both token and user for auto-login
  const initialToken = localStorage.getItem('kitakita_token');
  const initialUser = (() => {
    try {
      const raw = localStorage.getItem('kitakita_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  })();
  
  // Only auto-login if we have both token and user
  const [mode, setMode] = useState(() => {
    if (initialToken && initialUser) {
      // Check if it's a dummy token
      if (initialToken.startsWith('dummy_token_')) {
        return 'dashboard';
      }
    }
    return 'login';
  });
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'inventory', etc.
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // if token exists but no user, try to fetch /api/auth/me
    if (token && !user) {
      // Skip API call for dummy tokens
      if (token.startsWith('dummy_token_')) {
        // Try to restore user from localStorage
        try {
          const raw = localStorage.getItem('kitakita_user');
          if (raw) {
            const savedUser = JSON.parse(raw);
            if (savedUser && savedUser.email) {
              setUser(savedUser);
              setMode('dashboard');
              return;
            }
          }
        } catch (e) {
          // ignore
        }
        // If no saved user or invalid user, clear everything and show login
        setToken(null);
        setUser(null);
        setMode('login');
        localStorage.removeItem('kitakita_token');
        localStorage.removeItem('kitakita_user');
        return;
      }

      // For real tokens, try API
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
          
          // Map backend response to user object
          const user = {
            id: profile.userId,
            userId: profile.userId,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
            createdAt: profile.createdAt,
            lastLogin: profile.lastLogin
          };
          
          setUser(user);
          localStorage.setItem('kitakita_user', JSON.stringify(user));
          setMode('dashboard');
        } catch (e) {
          console.warn('Failed to fetch profile', e);
          setToken(null);
          setUser(null);
          setMode('login');
          localStorage.removeItem('kitakita_token');
          localStorage.removeItem('kitakita_user');
        }
      })();
    } else if (token && user) {
      // Valid session, ensure we're in dashboard mode
      setMode('dashboard');
    } else if (!token && !user && mode !== 'login' && mode !== 'signup') {
      // No valid session, ensure we show login
      setMode('login');
    }
  }, [token, user, apiBase, mode]);

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

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'sales':
        return <Sales />;
      case 'suppliers':
      case 'settings':
        return <div className="coming-soon">Coming Soon: {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</div>;
      default:
        return <Dashboard />;
    }
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
            <h2>Welcome to Kita Kita Inventory System, {user.fullName || user.email}!</h2>
            <p>Your email: {user.email}</p>
            <div className="status-box">
              <h3>System Status</h3>
              <p>✅ You're successfully logged in to the inventory management system.</p>
              <p>✅ Ready to manage your store inventory.</p>
            </div>
            <button className="btn-primary" onClick={handleLogout} style={{marginTop: '20px'}}>Log out</button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;