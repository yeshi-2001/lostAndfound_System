import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';

const MyItems = ({ user, token }) => {
  const [items, setItems] = useState({ found: [], lost: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('found');

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const [foundResponse, lostResponse] = await Promise.all([
        itemsAPI.getFoundItems().catch(() => ({ data: { items: [] } })),
        itemsAPI.getLostItems().catch(() => ({ data: { items: [] } }))
      ]);

      setItems({
        found: foundResponse.data.items || [],
        lost: lostResponse.data.items || []
      });
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading your items...</div>
      </div>
    );
  }

  return (
    <div style={{marginLeft: window.innerWidth > 768 ? 280 : 0, flex: 1, padding: window.innerWidth > 768 ? 30 : 20, paddingTop: window.innerWidth <= 768 ? 80 : 30, minHeight: '100vh', background: '#f8f9fa'}}>
      <div style={{marginBottom: 30}}>
        <h1 style={{fontSize: 32, fontWeight: '800', margin: '0 0 10px 0', color: '#03045E'}}>My Items 📦</h1>
        <p style={{fontSize: 18, color: '#666', margin: 0}}>Manage your reported lost and found items</p>
      </div>

      {/* Tab Navigation */}
      <div style={{display: 'flex', marginBottom: 30, background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <button
          onClick={() => setActiveTab('found')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: 8,
            background: activeTab === 'found' ? '#03045E' : 'transparent',
            color: activeTab === 'found' ? 'white' : '#666',
            fontSize: 16,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Found Items ({items.found.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: 8,
            background: activeTab === 'lost' ? '#03045E' : 'transparent',
            color: activeTab === 'lost' ? 'white' : '#666',
            fontSize: 16,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Lost Items ({items.lost.length})
        </button>
      </div>

      {/* Items Display */}
      <div style={{background: 'white', borderRadius: 15, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        {items[activeTab].length === 0 ? (
          <div style={{textAlign: 'center', padding: 40, color: '#666'}}>
            <div style={{fontSize: 48, marginBottom: 20}}>
              {activeTab === 'found' ? '📱' : '🔍'}
            </div>
            <div style={{fontSize: 18, fontWeight: '600', marginBottom: 10}}>
              No {activeTab} items yet
            </div>
            <div style={{fontSize: 14}}>
              {activeTab === 'found' 
                ? 'When you report found items, they will appear here'
                : 'When you report lost items, they will appear here'
              }
            </div>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20}}>
            {items[activeTab].map((item) => (
              <div 
                key={item.id}
                style={{
                  border: '2px solid #e9ecef',
                  borderRadius: 12,
                  padding: 20,
                  background: activeTab === 'found' ? '#f8fff9' : '#fff8f8',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                  <div style={{
                    background: activeTab === 'found' ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {activeTab === 'found' ? 'FOUND' : 'LOST'}
                  </div>
                  <div style={{fontSize: 12, color: '#999'}}>
                    {new Date(item.created_at || item.date_found || item.date_lost).toLocaleDateString()}
                  </div>
                </div>

                <h3 style={{fontSize: 18, fontWeight: '700', margin: '0 0 10px 0', color: '#333'}}>
                  {item.item_name}
                </h3>

                <div style={{marginBottom: 10}}>
                  <div style={{fontSize: 14, color: '#666', marginBottom: 5}}>
                    <strong>Category:</strong> {item.category}
                  </div>
                  <div style={{fontSize: 14, color: '#666', marginBottom: 5}}>
                    <strong>Location:</strong> {item.location || item.location_found || item.location_lost}
                  </div>
                  <div style={{fontSize: 14, color: '#666', marginBottom: 10}}>
                    <strong>Description:</strong> {(item.description || '').substring(0, 100)}
                    {(item.description || '').length > 100 ? '...' : ''}
                  </div>
                </div>

                <div style={{
                  padding: 10,
                  background: '#f8f9fa',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Status: Active
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;