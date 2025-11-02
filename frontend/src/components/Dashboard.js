import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI, verificationAPI } from '../services/api';

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

  useEffect(() => {
    loadDashboardData();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{width: '100%', minHeight: '100vh', position: 'relative', background: 'white', overflow: 'hidden'}}>
      <div style={{width: 326, height: 832, left: 0, top: 0, position: 'absolute', background: '#EBF5FD'}} />
      <div style={{width: 523, height: 33, left: 402, top: 135, position: 'absolute', opacity: 0.60, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10, border: '1px black solid'}} />
      <div style={{width: 28.61, height: 28.61, left: 420.38, top: 137.69, position: 'absolute', overflow: 'hidden', borderRadius: 10}}>
          <div style={{width: 15.90, height: 15.90, left: 3.58, top: 3.58, position: 'absolute', background: 'rgba(0, 0, 0, 0.16)'}} />
          <div style={{width: 17.88, height: 17.88, left: 3.58, top: 3.58, position: 'absolute', outline: '1.50px rgba(0, 0, 0, 0.80) solid', outlineOffset: '-0.75px'}} />
      </div>
      <div style={{width: 122.22, left: 593.86, top: 143, position: 'absolute', color: 'rgba(0, 0, 0, 0.80)', fontSize: 13, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Search here</div>
      <div style={{width: 111, height: 30, left: 1130, top: 135, position: 'absolute', borderRadius: 6, border: '2px black solid'}} />
      <div style={{width: 52, height: 20.45, left: 1160, top: 143.98, position: 'absolute', color: 'black', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Calendar</div>
      <div style={{width: 285, height: 54, left: 20, top: 157, position: 'absolute', background: 'white', boxShadow: '0px 4px 4px 6px rgba(0, 0, 0, 0.25)', borderRadius: 15}} />
      <div style={{left: 96, top: 172, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
      
      <Link to="/found-item" style={{textDecoration: 'none'}}>
        <div style={{left: 86, top: 252, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word', cursor: 'pointer'}}>Report Found</div>
      </Link>
      
      <Link to="/lost-item" style={{textDecoration: 'none'}}>
        <div style={{left: 86, top: 317, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word', cursor: 'pointer'}}>Report Lost</div>
      </Link>
      
      <Link to="/matches" style={{textDecoration: 'none'}}>
        <div style={{left: 83, top: 382, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word', cursor: 'pointer'}}>My Matches</div>
      </Link>
      
      <div style={{width: 473, left: 725, top: 20, position: 'absolute', color: 'black', fontSize: 35, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Welcome Back {user?.name || 'User'} 👋</div>
      <div style={{left: 711, top: 69, position: 'absolute', color: 'black', fontSize: 18, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Manage your lost and found items from your dashboard</div>
      <div style={{width: 151, height: 30, left: 962, top: 135, position: 'absolute', background: '#EBF5FD', borderRadius: 10, border: '1px black solid'}} />
      <div style={{width: 80, height: 30, left: 962, top: 135, position: 'absolute', background: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 12, borderBottomRightRadius: 12, borderBottomLeftRadius: 10, border: '1px black solid'}} />
      <div style={{left: 979, top: 140, position: 'absolute', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Weekly</div>
      <div style={{left: 1056, top: 140, position: 'absolute', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Daily</div>
      <div style={{width: 70.27, height: 70.27, left: 5.75, top: 21.43, position: 'absolute', background: 'white', borderRadius: 9999}} />
      <img style={{width: 84, height: 75.38, left: 0, top: 16, position: 'absolute'}} src="https://placehold.co/84x75" />
      <div style={{left: 111, top: 36, position: 'absolute', color: '#03045E', fontSize: 35, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Back2U</div>
      
      <Link to="/profile" style={{textDecoration: 'none'}}>
        <div style={{left: 78, top: 626, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word', cursor: 'pointer'}}>Settings</div>
        <img style={{width: 40, height: 40, left: 22, top: 614, position: 'absolute'}} src="https://placehold.co/40x40" />
      </Link>
      
      <div style={{width: 25, height: 25, left: 292, top: 22, position: 'absolute'}}>
          <div style={{width: 18.75, height: 18.75, left: 3.12, top: 3.12, position: 'absolute', background: 'black'}} />
      </div>
      <div style={{left: 83, top: 678, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Help</div>
      <img style={{width: 40, height: 40, left: 25, top: 667, position: 'absolute'}} src="https://placehold.co/40x40" />
      <div style={{width: 1279, height: 0, left: 325, top: 111, position: 'absolute', boxShadow: '4px 4px 4px ', outline: '2px rgba(0, 0, 0, 0.50) solid', outlineOffset: '-1px', filter: 'blur(2px)'}} />
      <div style={{width: 853, height: 206, left: 386, top: 196, position: 'absolute', background: 'rgba(0, 119, 182, 0.50)', borderRadius: 20}} />
      <div style={{width: 150.77, left: 412.85, top: 207, position: 'absolute', color: '#03045E', fontSize: 20, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Your Statistics</div>
      <div style={{width: 166.26, height: 100, left: 500.63, top: 249, position: 'absolute', background: '#EBF5FD', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 12, border: '2px white solid'}} />
      <div style={{width: 13.42, left: 570.85, top: 296, position: 'absolute', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{stats.foundItems}</div>
      <div style={{width: 100.17, left: 525.41, top: 256, position: 'absolute', color: 'black', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Item Found</div>
      <div style={{width: 166.26, height: 100, left: 711.30, top: 249, position: 'absolute', background: '#EBF5FD', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 12, border: '2px white solid'}} />
      <div style={{width: 16.52, left: 789.78, top: 296, position: 'absolute', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{stats.lostItems}</div>
      <div style={{width: 83.65, left: 748.47, top: 256, position: 'absolute', color: 'black', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Item Lost</div>
      <div style={{width: 186.47, height: 100, left: 925.06, top: 249, position: 'absolute', background: '#EBF5FD', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 12, border: '2px white solid'}} />
      <div style={{width: 17.93, left: 1015, top: 296, position: 'absolute', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>{stats.matches}</div>
      <div style={{width: 163.16, left: 937.46, top: 256, position: 'absolute', color: 'black', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Potential Matches</div>
      
      <Link to="/found-item" style={{textDecoration: 'none'}}>
        <div style={{width: 208, height: 203, left: 386, top: 440, position: 'absolute', background: '#C7F7D2', boxShadow: '4px 4px 4px ', borderRadius: 20, border: '1px black solid', cursor: 'pointer'}} />
        <div style={{width: 173, height: 105, left: 399, top: 509, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}><br/>Found something?<br/> Help someone get their item back!</div>
        <div style={{width: 166, height: 38.96, left: 403, top: 472.81, position: 'absolute'}}><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>📱 </span><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Report Found Item</span></div>
      </Link>
      
      <Link to="/lost-item" style={{textDecoration: 'none'}}>
        <div style={{width: 208, height: 203, left: 718, top: 440, position: 'absolute', background: '#C7EFF7', boxShadow: '4px 4px 4px ', borderRadius: 20, border: '1px black solid', cursor: 'pointer'}} />
        <div style={{width: 162, left: 737, top: 506, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Lost something? <br/>Let others know what you're looking for!<br/></div>
        <div style={{width: 151.23, left: 740.20, top: 456, position: 'absolute'}}><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>🔍</span><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}> Report Lost Item</span></div>
      </Link>
      
      <Link to="/matches" style={{textDecoration: 'none'}}>
        <div style={{width: 208, height: 203, left: 1031, top: 440, position: 'absolute', background: 'rgba(0, 0, 0, 0.43)', boxShadow: '4px 4px 4px ', borderRadius: 20, border: '1px black solid', cursor: 'pointer'}} />
        <div style={{width: 138, left: 1066, top: 498, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}><br/>Check potential matches and verify ownership</div>
        <div style={{left: 1055, top: 456, position: 'absolute'}}><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>🎯 </span><span style={{color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>View Matches</span></div>
      </Link>
      
      {/* Recent Found Items */}
      <div style={{width: 316, height: 211, left: 1269, top: 135, position: 'absolute', borderRadius: 20, border: '1px black solid', background: 'white'}} />
      <div style={{width: 157, height: 30.60, left: 1361, top: 159, position: 'absolute', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Recent Found Items</div>
      
      {recentItems.found.length > 0 ? (
        recentItems.found.map((item, index) => (
          <div key={item.id || index} style={{left: 1280, top: 185 + (index * 40), position: 'absolute', width: 290}}>
            <div style={{fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2}}>{item.item_name || 'Unknown Item'}</div>
            <div style={{fontSize: 12, color: '#666'}}>{item.category || 'Category'} • {item.location || 'Location'}</div>
          </div>
        ))
      ) : (
        <div style={{left: 1290, top: 200, position: 'absolute', fontSize: 12, color: '#999'}}>No found items yet</div>
      )}
      
      {/* Recent Lost Items */}
      <div style={{width: 316, height: 204, left: 1269, top: 431, position: 'absolute', borderRadius: 20, border: '1px black solid', background: 'white'}} />
      <div style={{width: 142, height: 29.59, left: 1369, top: 454, position: 'absolute', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '800', wordWrap: 'break-word'}}>Recent Lost Items</div>
      
      {recentItems.lost.length > 0 ? (
        recentItems.lost.map((item, index) => (
          <div key={item.id || index} style={{left: 1280, top: 480 + (index * 40), position: 'absolute', width: 290}}>
            <div style={{fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2}}>{item.item_name || 'Unknown Item'}</div>
            <div style={{fontSize: 12, color: '#666'}}>{item.category || 'Category'} • {item.location || 'Location'}</div>
          </div>
        ))
      ) : (
        <div style={{left: 1290, top: 500, position: 'absolute', fontSize: 12, color: '#999'}}>No lost items yet</div>
      )}
      
      <div style={{left: 73, top: 729, position: 'absolute', color: '#03045E', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word', cursor: 'pointer'}} onClick={() => window.location.href = '/login'}>Log Out</div>
      <img style={{width: 40, height: 40, left: 23, top: 719, position: 'absolute'}} src="https://placehold.co/40x40" />
    </div>
  );
};

export default Dashboard;