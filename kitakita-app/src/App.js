import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Sales from './components/Sales';
import Suppliers from './components/Suppliers';
import Settings from './components/Settings';

function App() {
  const [mode, setMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'inventory', etc.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const savedToken = localStorage.getItem('kitakita_token');
    const savedUser = localStorage.getItem('kitakita_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        setMode('dashboard');
      } catch {
        localStorage.removeItem('kitakita_user');
      }
    }
  }, []);

  useEffect(() => {
    if (!token && !user && mode !== 'login' && mode !== 'signup') {
      setMode('login');
    }
  }, [token, user, mode]);

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
    const pageProps = { token, user };
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'inventory':
        return <Inventory {...pageProps} />;
      case 'reports':
        return <Reports {...pageProps} />;
      case 'sales':
        return <Sales {...pageProps} />;
      case 'suppliers':
        return <Suppliers {...pageProps} />;
      case 'settings':
        return <Settings token={token} user={user} />;
      default:
        return <Dashboard {...pageProps} />;
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
        <Layout 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          user={user}
        >
          {renderPage()}
        </Layout>
      )}
    </div>
  );
}

export default App;