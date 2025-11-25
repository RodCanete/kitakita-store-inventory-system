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

function App() {
  // Always start at login page regardless of stored token
  const [mode, setMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'inventory', etc.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Simplified useEffect - only check if we should show login or dashboard
    if (!token && !user && mode !== 'login' && mode !== 'signup') {
      // No valid session, ensure we show login
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
        return <Suppliers />;
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