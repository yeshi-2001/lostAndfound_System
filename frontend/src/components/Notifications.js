import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const Notifications = ({ user, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // For now, using sample notifications since backend might not be ready
      const sampleNotifications = [
        {
          id: 1,
          title: "Item Successfully Returned",
          message: "🎊 Success! Your item has been successfully returned. Case closed!",
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Match Alert",
          message: "📱 Match Alert! Someone has claimed 1 of your found items. They are currently going through verification. You'll be contacted if verified.",
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];
      
      setNotifications(sampleNotifications);
      
      // Uncomment this when backend is ready:
      // const response = await notificationAPI.getNotifications(token);
      // setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId, token);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={{marginLeft: window.innerWidth > 768 ? 280 : 0, flex: 1, padding: window.innerWidth > 768 ? 30 : 20, paddingTop: window.innerWidth <= 768 ? 80 : 30, minHeight: '100vh', background: '#f8f9fa'}}>
      <div style={{marginBottom: 30}}>
        <h1 style={{fontSize: 32, fontWeight: '800', margin: '0 0 10px 0', color: '#03045E'}}>Notifications 🔔</h1>
        <p style={{fontSize: 18, color: '#666', margin: 0}}>Stay updated with your lost and found activities</p>
      </div>

      <div style={{background: 'white', borderRadius: 15, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        {!Array.isArray(notifications) || notifications.length === 0 ? (
          <div style={{textAlign: 'center', padding: 40, color: '#666'}}>
            <div style={{fontSize: 48, marginBottom: 20}}>📭</div>
            <div style={{fontSize: 18, fontWeight: '600', marginBottom: 10}}>No notifications yet</div>
            <div style={{fontSize: 14}}>You'll receive notifications when items are matched or verified</div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
            {Array.isArray(notifications) && notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                style={{
                  padding: 20,
                  border: `2px solid ${notification.read ? '#e9ecef' : '#03045E'}`,
                  borderRadius: 12,
                  background: notification.read ? '#f8f9fa' : '#EBF5FD',
                  cursor: notification.read ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10}}>
                  <div style={{
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: notification.read ? '#666' : '#03045E',
                    flex: 1
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    fontSize: 12, 
                    color: '#999',
                    marginLeft: 15
                  }}>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  fontSize: 14, 
                  color: notification.read ? '#666' : '#333',
                  lineHeight: '1.5'
                }}>
                  {notification.message}
                </div>
                {!notification.read && (
                  <div style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: '#03045E',
                    fontWeight: '500'
                  }}>
                    Click to mark as read
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;