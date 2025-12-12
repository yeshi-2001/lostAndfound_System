import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileMenuButton from './MobileMenuButton';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/lost-item', label: 'Report Lost Item' },
    { path: '/found-item', label: 'Report Found Item' },
    { path: '/my-items', label: 'My Items' },
    { path: '/matches', label: 'Matches' },
    { path: '/notifications', label: 'Notifications' }
  ];

  const bottomItems = [
    { path: '/profile', label: 'Settings' },
    { path: '/help', label: 'Help & Support' }
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div style={{padding: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '40px'}}>
          <img style={{width: 80, height: 80, objectFit: 'contain', marginRight: 15}} src="/image/logo2_1.png" alt="Logo" />
          <h1 style={{color: '#03045E', fontSize: 28, fontWeight: '800', margin: 0}}>Back2U</h1>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{flex: 1, padding: '20px 15px'}}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                display: 'block',
                padding: '16px 20px',
                margin: '8px 0',
                borderRadius: 12,
                background: isActive ? 'white' : 'transparent',
                color: isActive ? '#03045E' : '#1e40af',
                fontSize: 15,
                fontWeight: isActive ? '700' : '600',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.3s ease',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.2)'
              }}
              onClick={() => setIsMobileOpen(false)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={{marginTop: 'auto', padding: '0 20px 20px'}}>
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                display: 'block',
                padding: '12px 20px',
                margin: '4px 0',
                borderRadius: 8,
                background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: '#1e40af',
                fontSize: 14,
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setIsMobileOpen(false)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isActive ? 'rgba(255,255,255,0.2)' : 'transparent';
              }}
            >
              {item.label}
            </Link>
          );
        })}
        
        <div 
          style={{
            padding: '12px 20px',
            margin: '8px 0 0 0',
            borderRadius: 8,
            background: 'transparent',
            color: '#dc2626',
            fontSize: 14,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(220, 38, 38, 0.1)';
            e.target.style.borderColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
        >
          Log Out
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton 
        onToggle={() => setIsMobileOpen(!isMobileOpen)}
        isOpen={isMobileOpen}
      />

      {/* Desktop Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 280,
          height: '100vh',
          background: '#D1E7F5',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transform: isMobile ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1001
            }}
            onClick={() => setIsMobileOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: 280,
              height: '100vh',
              background: '#D1E7F5',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1002,
              transform: 'translateX(0)',
              transition: 'transform 0.3s ease'
            }}
          >
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;