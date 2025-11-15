import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI, verificationAPI } from '../services/api';
import DeleteConfirmation from './DeleteConfirmation';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    foundItems: 1,
    lostItems: 2,
    matches: 3
  });
  const [recentItems, setRecentItems] = useState({
    found: [],
    lost: []
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null, itemType: null, itemName: '' });
  const [welcomeInfo, setWelcomeInfo] = useState({
    welcome_message: 'Welcome back!',
    activity_message: 'Everything is just as you left it ✨',
    change_details: [],
    changes: {}
  });

  useEffect(() => {
    loadDashboardData();
    loadWelcomeInfo();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [foundResponse, lostResponse, matchesResponse] = await Promise.all([
        itemsAPI.getFoundItems().catch(err => ({ data: { items: [] } })),
        itemsAPI.getLostItems().catch(err => ({ data: { items: [] } })),
        verificationAPI.getMatches().catch(err => ({ data: { matches: [] } }))
      ]);

      setStats({
        foundItems: foundResponse.data.items?.length || 1,
        lostItems: lostResponse.data.items?.length || 2,
        matches: matchesResponse.data.matches?.length || 3
      });

      setRecentItems({
        found: foundResponse.data.items?.slice(0, 3) || [],
        lost: lostResponse.data.items?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadWelcomeInfo = async () => {
    try {
      const response = await fetch('/api/dashboard/welcome-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setWelcomeInfo(data);
      }
    } catch (error) {
      console.error('Error loading welcome info:', error);
    }
  };



  const handleDeleteItem = (itemId, itemType, itemName) => {
    setDeleteModal({ isOpen: true, itemId, itemType, itemName });
  };

  const confirmDelete = async (reason) => {
    try {
      const response = await fetch(`/api/items/${deleteModal.itemId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: deleteModal.itemType, reason })
      });
      
      if (response.ok) {
        // Reload dashboard data
        loadDashboardData();
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Search in both found and lost items
      const [foundResponse, lostResponse] = await Promise.all([
        itemsAPI.getFoundItems().catch(() => ({ data: { items: [] } })),
        itemsAPI.getLostItems().catch(() => ({ data: { items: [] } }))
      ]);

      const allItems = [
        ...(foundResponse.data.items || []).map(item => ({ ...item, type: 'Found' })),
        ...(lostResponse.data.items || []).map(item => ({ ...item, type: 'Lost' }))
      ];

      // Filter items based on search term
      const filtered = allItems.filter(item => 
        item.item_name?.toLowerCase().includes(term.toLowerCase()) ||
        item.category?.toLowerCase().includes(term.toLowerCase()) ||
        item.location?.toLowerCase().includes(term.toLowerCase()) ||
        item.description?.toLowerCase().includes(term.toLowerCase())
      );

      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: 'white'}}>
      {/* Sidebar */}
      <div style={{width: 280, background: '#EBF5FD', padding: 20, display: 'flex', flexDirection: 'column'}}>
        {/* Logo */}
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 40}}>
          <img style={{width: 80, height: 80, objectFit: 'contain', marginRight: 15}} src="/image/logo2%201.png" alt="Logo" />
          <h1 style={{color: '#03045E', fontSize: 28, fontWeight: '800', margin: 0}}>Back2U</h1>
        </div>
        
        {/* Navigation */}
        <nav style={{flex: 1}}>
          <div style={{background: 'white', padding: 15, borderRadius: 15, marginBottom: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
            <div style={{color: '#03045E', fontSize: 16, fontWeight: '700'}}>Dashboard</div>
          </div>
          
          <Link to="/found-item" style={{textDecoration: 'none', display: 'block', padding: '15px 0', color: '#03045E', fontSize: 16, fontWeight: '700'}}>Report Found</Link>
          <Link to="/lost-item" style={{textDecoration: 'none', display: 'block', padding: '15px 0', color: '#03045E', fontSize: 16, fontWeight: '700'}}>Report Lost</Link>
          <Link to="/matches" style={{textDecoration: 'none', display: 'block', padding: '15px 0', color: '#03045E', fontSize: 16, fontWeight: '700'}}>My Matches</Link>
          <Link to="/cleanup" style={{textDecoration: 'none', display: 'block', padding: '15px 0', color: '#03045E', fontSize: 16, fontWeight: '700'}}>🗑️ Clean Up Items</Link>
        </nav>
        
        {/* Bottom Menu */}
        <div style={{marginTop: 'auto'}}>
          <Link to="/profile" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '10px 0', color: '#03045E', fontSize: 16, fontWeight: '700'}}>
            <img style={{width: 24, height: 24, marginRight: 10}} src="/image/Gear.png" alt="Settings" />
            Settings
          </Link>
          <div style={{display: 'flex', alignItems: 'center', padding: '10px 0', color: '#03045E', fontSize: 16, fontWeight: '700', cursor: 'pointer'}} onClick={() => window.location.href = '/login'}>
            <img style={{width: 24, height: 24, marginRight: 10}} src="/image/exit.svg" alt="Logout" />
            Log Out
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{flex: 1, padding: 30, overflow: 'auto'}} onClick={() => setShowResults(false)}>
        {/* Header */}
        <div style={{marginBottom: 30}}>
          <h1 style={{fontSize: 32, fontWeight: '800', margin: '0 0 10px 0'}}>{welcomeInfo.welcome_message} {user?.name || 'User'} 👋</h1>
          <p style={{fontSize: 18, color: '#666', margin: '0 0 10px 0'}}>{welcomeInfo.activity_message}</p>
          {welcomeInfo.change_details.length > 0 && (
            <div style={{background: '#EBF5FD', padding: 15, borderRadius: 10, border: '1px solid #2E72F9'}}>
              <div style={{fontSize: 14, fontWeight: '600', color: '#03045E', marginBottom: 8}}>What's New:</div>
              <div style={{fontSize: 14, color: '#03045E'}}>{welcomeInfo.change_details.join(' • ')}</div>
              <div style={{marginTop: 10, display: 'flex', gap: 10}}>
                {welcomeInfo.changes.new_matches > 0 && (
                  <Link to="/matches" style={{background: '#2E72F9', color: 'white', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontSize: 12}}>View Matches</Link>
                )}
                {welcomeInfo.changes.pending_verifications > 0 && (
                  <Link to="/matches" style={{background: '#F59E0B', color: 'white', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontSize: 12}}>Complete Verification</Link>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div style={{display: 'flex', gap: 20, marginBottom: 30}}>
          <div style={{flex: 1, position: 'relative'}}>
            <input 
              type="text" 
              placeholder="Search items, categories, locations..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={() => setShowResults(true)}
              style={{
                width: '100%', 
                padding: '12px 40px 12px 15px', 
                border: '1px solid #ddd', 
                borderRadius: 10, 
                fontSize: 14,
                boxSizing: 'border-box'
              }} 
            />
            <img style={{position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16}} src="/image/si_search-duotone.svg" alt="Search" />
            
            {/* Search Results Dropdown */}
            {showResults && searchTerm && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 10,
                marginTop: 5,
                maxHeight: 300,
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                {searchResults.length > 0 ? (
                  searchResults.map((item, index) => (
                    <div key={index} style={{
                      padding: 15,
                      borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                      cursor: 'pointer',
                      ':hover': {background: '#f5f5f5'}
                    }}>
                      <div style={{fontWeight: '600', marginBottom: 5}}>{item.item_name}</div>
                      <div style={{fontSize: 12, color: '#666'}}>{item.category} • {item.location} • {item.type}</div>
                    </div>
                  ))
                ) : (
                  <div style={{padding: 15, color: '#999', textAlign: 'center'}}>No items found</div>
                )}
              </div>
            )}
          </div>
          <div style={{padding: '10px 20px', border: '2px solid black', borderRadius: 6, background: 'white', fontSize: 12, display: 'flex', alignItems: 'center'}}>
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        {/* Statistics */}
        <div style={{background: 'rgba(0, 119, 182, 0.50)', borderRadius: 20, padding: 30, marginBottom: 30}}>
          <h2 style={{color: '#03045E', fontSize: 20, fontWeight: '800', marginBottom: 20}}>Your Statistics</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20}}>
            <div style={{background: '#EBF5FD', padding: 20, borderRadius: 12, textAlign: 'center', border: '2px solid white'}}>
              <div style={{fontSize: 24, fontWeight: '600', color: 'black', marginBottom: 5}}>{stats.foundItems}</div>
              <div style={{fontSize: 16, fontWeight: '600', color: 'black'}}>Items Found</div>
            </div>
            <div style={{background: '#EBF5FD', padding: 20, borderRadius: 12, textAlign: 'center', border: '2px solid white'}}>
              <div style={{fontSize: 24, fontWeight: '600', color: 'black', marginBottom: 5}}>{stats.lostItems}</div>
              <div style={{fontSize: 16, fontWeight: '600', color: 'black'}}>Items Lost</div>
            </div>
            <div style={{background: '#EBF5FD', padding: 20, borderRadius: 12, textAlign: 'center', border: '2px solid white'}}>
              <div style={{fontSize: 24, fontWeight: '600', color: 'black', marginBottom: 5}}>{stats.matches}</div>
              <div style={{fontSize: 16, fontWeight: '600', color: 'black'}}>Potential Matches</div>
            </div>
          </div>
        </div>
        
        {/* Action Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30}}>
          <Link to="/found-item" style={{textDecoration: 'none'}}>
            <div style={{background: '#C7F7D2', padding: 25, borderRadius: 20, border: '1px solid black', cursor: 'pointer', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div style={{fontSize: 16, fontWeight: '800', color: 'black'}}>📱 Report Found Item</div>
              <div style={{fontSize: 14, color: 'black', textAlign: 'center'}}>Found something?<br/>Help someone get their item back!</div>
            </div>
          </Link>
          
          <Link to="/lost-item" style={{textDecoration: 'none'}}>
            <div style={{background: '#C7EFF7', padding: 25, borderRadius: 20, border: '1px solid black', cursor: 'pointer', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div style={{fontSize: 16, fontWeight: '800', color: 'black'}}>🔍 Report Lost Item</div>
              <div style={{fontSize: 14, color: 'black', textAlign: 'center'}}>Lost something?<br/>Let others know what you're looking for!</div>
            </div>
          </Link>
          
          <Link to="/matches" style={{textDecoration: 'none'}}>
            <div style={{background: 'rgba(0, 0, 0, 0.43)', padding: 25, borderRadius: 20, border: '1px solid black', cursor: 'pointer', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div style={{fontSize: 16, fontWeight: '700', color: 'white'}}>🎯 View Matches</div>
              <div style={{fontSize: 14, color: 'white', textAlign: 'center'}}>Check potential matches and verify ownership</div>
            </div>
          </Link>
        </div>
        
        {/* Recent Items */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20}}>
          {/* Recent Found Items */}
          <div style={{background: 'white', border: '1px solid black', borderRadius: 20, padding: 20}}>
            <h3 style={{fontSize: 16, fontWeight: '800', marginBottom: 15}}>Recent Found Items</h3>
            {recentItems.found.length > 0 ? (
              recentItems.found.map((item, index) => (
                <div key={item.id || index} style={{marginBottom: 15, paddingBottom: 10, borderBottom: index < recentItems.found.length - 1 ? '1px solid #eee' : 'none'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2}}>{item.item_name || 'Unknown Item'}</div>
                      <div style={{fontSize: 12, color: '#666'}}>{item.category || 'Category'} • {item.location || 'Location'}</div>
                    </div>
                    <button 
                      style={{background: '#EF4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer'}}
                      onClick={() => handleDeleteItem(item.id, 'found', item.item_name)}
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{fontSize: 12, color: '#999', textAlign: 'center', padding: 20}}>No found items yet</div>
            )}
          </div>
          
          {/* Recent Lost Items */}
          <div style={{background: 'white', border: '1px solid black', borderRadius: 20, padding: 20}}>
            <h3 style={{fontSize: 16, fontWeight: '800', marginBottom: 15}}>Recent Lost Items</h3>
            {recentItems.lost.length > 0 ? (
              recentItems.lost.map((item, index) => (
                <div key={item.id || index} style={{marginBottom: 15, paddingBottom: 10, borderBottom: index < recentItems.lost.length - 1 ? '1px solid #eee' : 'none'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2}}>{item.item_name || 'Unknown Item'}</div>
                      <div style={{fontSize: 12, color: '#666'}}>{item.category || 'Category'} • {item.location || 'Location'}</div>
                    </div>
                    <button 
                      style={{background: '#EF4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer'}}
                      onClick={() => handleDeleteItem(item.id, 'lost', item.item_name)}
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{fontSize: 12, color: '#999', textAlign: 'center', padding: 20}}>No lost items yet</div>
            )}
          </div>
        </div>
      </div>
      
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemType: null, itemName: '' })}
        onConfirm={confirmDelete}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
      />
    </div>
  );
};

export default Dashboard;