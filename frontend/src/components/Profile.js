import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Profile = ({ user, token, onLogout }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    department: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile with token:', token);
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API error:', errorText);
        throw new Error(`Failed to load profile: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Profile data received:', result);
      const data = result.data;
      
      setProfileData(data);
      setFormData({
        name: data.name,
        email: data.email,
        contact_number: data.contact_number,
        department: data.department
      });
      setPrivacySettings(data.notification_preferences || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage(`Failed to load profile data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+94\s?\d{2}\s?\d{3}\s?\d{4}$/;
    if (!formData.contact_number || !phoneRegex.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid phone number (+94 XX XXX XXXX)';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setProfileData(prev => ({ ...prev, ...formData }));
      setEditMode(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData.name,
      email: profileData.email,
      contact_number: profileData.contact_number,
      department: profileData.department
    });
    setEditMode(false);
    setErrors({});
  };

  const getContributionBadge = (score) => {
    if (score >= 90) return { emoji: '🌟', text: 'Super Helper' };
    if (score >= 70) return { emoji: '⭐', text: 'Active Member' };
    if (score >= 50) return { emoji: '👍', text: 'Good Member' };
    return { emoji: '🆕', text: 'New Member' };
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const savePrivacySettings = async () => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacySettings)
      });
      
      if (response.ok) {
        setMessage('Privacy settings updated successfully!');
        setShowPrivacyModal(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to update privacy settings');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#EFF6FF',
      padding: '20px',
      fontFamily: 'Calibri, sans-serif'
    },
    content: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#03045E',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    title: {
      fontSize: '32px',
      color: '#1F2937',
      margin: '0',
      fontWeight: 'bold'
    },
    section: {
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    profileHeader: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    avatar: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: '#03045E',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: 'bold',
      margin: '0 auto 15px',
      cursor: 'pointer',
      position: 'relative'
    },
    avatarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      opacity: 0,
      transition: 'opacity 0.3s'
    },
    userName: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1F2937',
      margin: '0 0 5px 0'
    },
    userReg: {
      fontSize: '18px',
      color: '#6B7280',
      margin: '0 0 5px 0'
    },
    userDept: {
      fontSize: '16px',
      color: '#6B7280',
      margin: '0 0 10px 0'
    },
    memberSince: {
      fontSize: '14px',
      color: '#6B7280',
      margin: '0'
    },
    fieldGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '5px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#EF4444'
    },
    inputReadonly: {
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
      cursor: 'not-allowed'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    error: {
      color: '#EF4444',
      fontSize: '14px',
      marginTop: '5px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s'
    },
    primaryButton: {
      background: '#03045E',
      color: 'white'
    },
    secondaryButton: {
      background: 'transparent',
      color: '#374151',
      border: '2px solid #D1D5DB'
    },
    editButton: {
      background: 'transparent',
      color: '#03045E',
      border: '1px solid #03045E',
      padding: '8px 16px',
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    statCard: {
      background: '#F9FAFB',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    statIcon: {
      fontSize: '32px',
      marginBottom: '10px'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1F2937',
      margin: '0 0 5px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6B7280',
      margin: '0'
    },
    contributionCard: {
      background: 'linear-gradient(135deg, #03045E, #001D3D)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    notificationGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '30px'
    },
    checkboxGroup: {
      marginBottom: '15px'
    },
    checkbox: {
      marginRight: '10px'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '15px 20px',
      background: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '10px',
      transition: 'all 0.2s'
    },
    deleteButton: {
      color: '#EF4444',
      borderColor: '#EF4444'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center'
    },
    message: {
      padding: '12px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
      fontWeight: '600'
    },
    successMessage: {
      background: '#D1FAE5',
      color: '#065F46',
      border: '1px solid #10B981'
    },
    errorMessage: {
      background: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #EF4444'
    }
  };

  if (loading || !profileData) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.section}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const badge = getContributionBadge(profileData.statistics.contribution_score);

  return (
    <div style={{minHeight: '100vh', background: '#EFF6FF', padding: 20, paddingTop: window.innerWidth <= 768 ? 80 : 20, fontFamily: 'Inter, sans-serif', marginLeft: window.innerWidth > 768 ? 280 : 0}}>
      <div style={{maxWidth: 1000, margin: '0 auto'}}>
        <div style={{marginBottom: 30}}>
          <h1 style={{fontSize: 32, fontWeight: '800', margin: 0}}>My Profile</h1>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('success') ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        {/* Profile Header */}
        <div style={{background: 'white', borderRadius: 16, padding: 30, marginBottom: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 style={styles.userName}>{profileData.name}</h2>
            <p style={styles.userReg}>{profileData.registration_number}</p>
            <p style={styles.userDept}>{profileData.department}</p>
            <p style={styles.memberSince}>
              Member since: {new Date(profileData.member_since).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div style={{background: 'white', borderRadius: 16, padding: 30, marginBottom: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <div style={styles.sectionTitle}>
            Personal Information
            {!editMode && (
              <button 
                style={{...styles.button, ...styles.editButton}}
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>👤 Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {}),
                ...(editMode ? {} : styles.inputReadonly)
              }}
              readOnly={!editMode}
            />
            {errors.name && <div style={styles.error}>{errors.name}</div>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>🆔 Registration Number</label>
            <input
              type="text"
              value={profileData.registration_number}
              style={{...styles.input, ...styles.inputReadonly}}
              readOnly
            />
            <div style={{fontSize: '12px', color: '#6B7280', marginTop: '5px'}}>
              Cannot be changed
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>✉️ Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
                ...(editMode ? {} : styles.inputReadonly)
              }}
              readOnly={!editMode}
            />
            {errors.email && <div style={styles.error}>{errors.email}</div>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>📱 Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.contact_number ? styles.inputError : {}),
                ...(editMode ? {} : styles.inputReadonly)
              }}
              readOnly={!editMode}
            />
            {errors.contact_number && <div style={styles.error}>{errors.contact_number}</div>}
            <div style={{fontSize: '12px', color: '#6B7280', marginTop: '5px'}}>
              Used for notifications
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>🏢 Department</label>
            {editMode ? (
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  ...(errors.department ? styles.inputError : {})
                }}
              >
                <option value="">Select Department</option>
                <option value="Faculty of Applied Science">Faculty of Applied Science</option>
                <option value="Faculty of Communication and Business Studies">Faculty of Communication and Business Studies</option>
                <option value="Faculty of Siddha Medicine">Faculty of Siddha Medicine</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="Faculty of Medicine">Faculty of Medicine</option>
                <option value="Faculty of Arts">Faculty of Arts</option>
                <option value="Faculty of Science">Faculty of Science</option>
                <option value="Faculty of Management">Faculty of Management</option>
                <option value="Faculty of Law">Faculty of Law</option>
                <option value="Faculty of Education">Faculty of Education</option>
                <option value="Faculty of Agriculture">Faculty of Agriculture</option>
                <option value="Faculty of Veterinary Medicine">Faculty of Veterinary Medicine</option>
                <option value="Faculty of Dental Sciences">Faculty of Dental Sciences</option>
                <option value="Faculty of Pharmacy">Faculty of Pharmacy</option>
                <option value="Faculty of Architecture">Faculty of Architecture</option>
                <option value="Faculty of Social Sciences">Faculty of Social Sciences</option>
                <option value="Faculty of Information Technology">Faculty of Information Technology</option>
                <option value="Faculty of Computing">Faculty of Computing</option>
                <option value="Faculty of Economics">Faculty of Economics</option>
                <option value="Faculty of Fine Arts">Faculty of Fine Arts</option>
              </select>
            ) : (
              <input
                type="text"
                value={formData.department}
                style={{...styles.input, ...styles.inputReadonly}}
                readOnly
              />
            )}
            {errors.department && <div style={styles.error}>{errors.department}</div>}
          </div>

          {editMode && (
            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Activity Statistics */}
        <div style={{background: 'white', borderRadius: 16, padding: 30, marginBottom: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <div style={styles.sectionTitle}>Your Activity</div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard} onClick={() => navigate('/dashboard')}>
              <div style={styles.statIcon}>📦</div>
              <div style={styles.statNumber}>{profileData.statistics.found_items_active}</div>
              <div style={styles.statLabel}>Found Items<br/>Active</div>
            </div>
            
            <div style={styles.statCard} onClick={() => navigate('/dashboard')}>
              <div style={styles.statIcon}>📢</div>
              <div style={styles.statNumber}>{profileData.statistics.lost_items_searching}</div>
              <div style={styles.statLabel}>Lost Items<br/>Searching</div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statNumber}>{profileData.statistics.successful_returns}</div>
              <div style={styles.statLabel}>Successful<br/>Returns</div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🎯</div>
              <div style={styles.statNumber}>{profileData.statistics.total_matches}</div>
              <div style={styles.statLabel}>Total<br/>Matches</div>
            </div>
          </div>

          <div style={styles.contributionCard}>
            <div style={{fontSize: '24px', marginBottom: '10px'}}>
              {badge.emoji} Contribution Score: {profileData.statistics.contribution_score}%
            </div>
            <div>You're a {badge.text.toLowerCase()}!</div>
          </div>
        </div>

        {/* Account Actions */}
        <div style={{background: 'white', borderRadius: 16, padding: 30, marginBottom: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <div style={styles.sectionTitle}>Account</div>
          
          
          <button 
            style={styles.actionButton}
            onClick={() => setShowPrivacyModal(true)}
          >
            🔒 Privacy Settings
            <div style={{fontSize: '14px', color: '#6B7280'}}>Manage your privacy preferences</div>
          </button>
          
          <button style={styles.actionButton}>
            📖 Terms & Conditions
            <div style={{fontSize: '14px', color: '#6B7280'}}>Read our terms of service</div>
          </button>
          
          <button style={styles.actionButton}>
            ❓ Help & Support
            <div style={{fontSize: '14px', color: '#6B7280'}}>Get help or contact support</div>
          </button>
          
          <button 
            style={styles.actionButton}
            onClick={() => setShowLogoutModal(true)}
          >
            🚪 Logout
            <div style={{fontSize: '14px', color: '#6B7280'}}>Sign out of your account</div>
          </button>
          
          <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #E5E7EB'}} />
          
          <button 
            style={{...styles.actionButton, ...styles.deleteButton}}
            onClick={() => setShowDeleteModal(true)}
          >
            ⚠️ Delete Account
            <div style={{fontSize: '14px', color: '#EF4444'}}>Permanently delete your account</div>
          </button>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Logout</h3>
              <p>Are you sure you want to logout?</p>
              <p style={{color: '#6B7280', fontSize: '14px'}}>
                You'll need to login again to access your account.
              </p>
              <div style={styles.buttonGroup}>
                <button 
                  style={{...styles.button, ...styles.secondaryButton}}
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button 
                  style={{...styles.button, ...styles.primaryButton}}
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout();
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings Modal */}
        {showPrivacyModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Privacy Settings</h3>
              <div style={{textAlign: 'left', margin: '20px 0'}}>
                <div style={styles.fieldGroup}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={privacySettings.match_found || false}
                      onChange={(e) => handlePrivacyChange('match_found', e.target.checked)}
                    />
                    📧 Email notifications for matches
                  </label>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={privacySettings.sms_enabled || false}
                      onChange={(e) => handlePrivacyChange('sms_enabled', e.target.checked)}
                    />
                    📱 SMS notifications
                  </label>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={privacySettings.verification_ready || false}
                      onChange={(e) => handlePrivacyChange('verification_ready', e.target.checked)}
                    />
                    ✅ Verification notifications
                  </label>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={privacySettings.quiet_hours_enabled || false}
                      onChange={(e) => handlePrivacyChange('quiet_hours_enabled', e.target.checked)}
                    />
                    🌙 Enable quiet hours (10 PM - 8 AM)
                  </label>
                </div>
              </div>
              <div style={styles.buttonGroup}>
                <button 
                  style={{...styles.button, ...styles.secondaryButton}}
                  onClick={() => setShowPrivacyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  style={{...styles.button, ...styles.primaryButton}}
                  onClick={savePrivacySettings}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={{color: '#EF4444'}}>⚠️ Delete Account</h3>
              <p>Are you sure you want to delete your account?</p>
              <div style={{textAlign: 'left', margin: '20px 0'}}>
                <p>This will permanently delete:</p>
                <ul>
                  <li>All your found items</li>
                  <li>All your lost items</li>
                  <li>Your match history</li>
                  <li>Your profile information</li>
                </ul>
              </div>
              <p style={{color: '#EF4444', fontWeight: 'bold'}}>
                ⚠️ This action CANNOT be undone!
              </p>
              <div style={styles.buttonGroup}>
                <button 
                  style={{...styles.button, ...styles.secondaryButton}}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  style={{...styles.button, background: '#EF4444', color: 'white'}}
                  onClick={() => {
                    // Handle account deletion
                    setShowDeleteModal(false);
                    alert('Account deletion would be implemented here');
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;