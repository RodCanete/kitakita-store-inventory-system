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
import Categories from './components/Categories';

function App() {
  const [mode, setMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'inventory', etc.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const savedToken = localStorage.getItem('kitakita_token');
    const savedUser = localStorage.getItem('kitakita_user');
    
    if (savedToken && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userObj);
        setMode('dashboard');
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        // If there's an error parsing, clear invalid data and go to login
        localStorage.removeItem('kitakita_token');
        localStorage.removeItem('kitakita_user');
        setMode('login');
      }
    } else {
      // No saved credentials, go to login
      setMode('login');
      setToken(null);
      setUser(null);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleAuthSuccess = (newToken, userObj) => {
    setToken(newToken);
    setUser(userObj);
    localStorage.setItem('kitakita_token', newToken);
    localStorage.setItem('kitakita_user', JSON.stringify(userObj));
    setMode('dashboard');
    setCurrentPage('dashboard'); // Explicitly set to dashboard after login
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
    setCurrentPage('dashboard'); // Reset to default page after logout
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    // Only render protected pages when authenticated
    if (!token || !user) {
      return null; // Don't render anything if not authenticated
    }
    
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
      case 'categories':
        return <Categories {...pageProps} />;
      case 'settings':
        return <div className="coming-soon">Coming Soon: {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</div>;
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

      {mode === 'dashboard' && user && token && (
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