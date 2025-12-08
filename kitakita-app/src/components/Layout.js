import React from 'react';
import '../App.css';
import logo from '../images/app_logo.png';

export default function Layout({ children, currentPage, onNavigate, onLogout, user }) {
  // Get user initials for avatar
  const getUserInitials = () => {
    if (user && user.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="KITA KITA" className="sidebar-logo" />
          <span className="sidebar-title">KITA KITA</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => onNavigate('inventory')}
          >
            <span className="nav-icon">📦</span>
            Inventory
          </button>
          <button 
            className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => onNavigate('reports')}
          >
            <span className="nav-icon">📈</span>
            Reports
          </button>
          <button 
            className={`nav-item ${currentPage === 'suppliers' ? 'active' : ''}`}
            onClick={() => onNavigate('suppliers')}
          >
            <span className="nav-icon">👥</span>
            Suppliers
          </button>
          <button 
            className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}
            onClick={() => onNavigate('sales')}
          >
            <span className="nav-icon">💰</span>
            Sales
          </button>
          <button 
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
          <button 
            className="nav-item logout"
            onClick={onLogout}
          >
            <span className="nav-icon">🚪</span>
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
           
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search product, supplier, order" 
              className="search-input"
            />
          </div>
          <div className="top-bar-right">
            <button className="icon-button">🔔</button>
            <div className="user-avatar" title={user ? user.fullName : 'User'}>
              {user ? (
                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#0b63e8', color: 'white', fontWeight: 'bold', fontSize: '16px'}}>
                  {getUserInitials()}
                </span>
              ) : (
                <img src="https://ui-avatars.com/api/?name=User&background=0b63e8&color=fff" alt="User" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}