import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';

const LostItemForm = ({ token, user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    item_name: '',
    brand: '',
    color: '',
    location: '',
    other_location: '',
    not_sure_location_description: '',
    date_lost: new Date().toISOString().split('T')[0],
    description: '',
    additional_info: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [matchFound, setMatchFound] = useState(false);

  const categories = [
    'Electronics', 'Personal Items', 'Bags & Accessories', 
    'Books & Stationery', 'Clothing', 'Sports Equipment', 'Other'
  ];

  const colors = [
    { value: 'Black', emoji: '⚫' },
    { value: 'White', emoji: '⚪' },
    { value: 'Blue', emoji: '🔵' },
    { value: 'Red', emoji: '🔴' },
    { value: 'Green', emoji: '🟢' },
    { value: 'Yellow', emoji: '🟡' },
    { value: 'Grey', emoji: '⚪' },
    { value: 'Brown', emoji: '🟤' },
    { value: 'Pink', emoji: '🌸' },
    { value: 'Multi-color', emoji: '🌈' },
    { value: "Don't Remember", emoji: '❓' },
    { value: 'Other', emoji: '🎨' }
  ];

  const locations = [
    { group: 'Academic Buildings', options: [
      'Main Entrance', 'IT Building', 'Library', 
      'Faculty of Applied Science', 'Faculty of Communication and Business Studies', 
      'Faculty of Siddha Medicine'
    ]},
    { group: 'Dining Areas', options: ['Old Main Cafeteria', 'Green Cafeteria'] },
    { group: 'Recreation', options: ['Play Ground', 'Sport Complex'] },
    { group: 'Girls Hostels', options: [
      'Girls Hostel - New Sarasavi', 'Girls Hostel - Old Sarasavi', 'Girls Hostel - Marbel'
    ]},
    { group: 'Boys Hostel', options: ['Boys Hostel'] },
    { group: 'Uncertain', options: ['Not Sure'] },
    { group: 'Other', options: ['Other (Please Specify)'] }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'category':
        if (!value) newErrors.category = 'Please tell us what you lost';
        else delete newErrors.category;
        break;
      case 'item_name':
        if (!value) newErrors.item_name = 'Item name is required';
        else if (value.length < 3) newErrors.item_name = 'Item name must be at least 3 characters';
        else if (value.length > 100) newErrors.item_name = 'Item name cannot exceed 100 characters';
        else delete newErrors.item_name;
        break;
      case 'brand':
        if (value && value.length > 50) newErrors.brand = 'Brand cannot exceed 50 characters';
        else delete newErrors.brand;
        break;
      case 'color':
        if (!value) newErrors.color = 'Please select a color (approximate is fine)';
        else delete newErrors.color;
        break;
      case 'location':
        if (!value) newErrors.location = 'Please select approximate location';
        else delete newErrors.location;
        break;
      case 'other_location':
        if (formData.location === 'Other (Please Specify)' && !value) {
          newErrors.other_location = 'Please specify the location';
        } else delete newErrors.other_location;
        break;
      case 'not_sure_location_description':
        if (formData.location === 'Not Sure' && !value) {
          newErrors.not_sure_location_description = 'Please describe where you think you lost it';
        } else delete newErrors.not_sure_location_description;
        break;
      case 'date_lost':
        if (!value) newErrors.date_lost = 'Please select approximate date';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
          if (selectedDate > today) newErrors.date_lost = 'Cannot select future dates';
          else if (selectedDate < thirtyDaysAgo) newErrors.date_lost = 'Cannot select dates older than 30 days';
          else delete newErrors.date_lost;
        }
        break;
      case 'description':
        if (!value) newErrors.description = 'We need more details to help find your item';
        else if (value.length < 30) newErrors.description = 'Description must be at least 30 characters for better verification';
        else if (value.length > 500) newErrors.description = 'Description cannot exceed 500 characters';
        else delete newErrors.description;
        break;
      case 'additional_info':
        if (value && value.length > 300) newErrors.additional_info = 'Additional info cannot exceed 300 characters';
        else delete newErrors.additional_info;
        break;
      case 'images':
        if (value && value.length > 5) newErrors.images = 'Maximum 5 photos allowed';
        else delete newErrors.images;
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = { ...errors };

    files.forEach(file => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        newErrors.images = 'Only JPG and PNG files are allowed';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.images = 'Each file must be less than 5MB';
        return;
      }
      validFiles.push(file);
    });

    if (formData.images.length + validFiles.length > 5) {
      newErrors.images = 'Maximum 5 photos allowed';
      setErrors(newErrors);
      return;
    }

    const newImages = [...formData.images, ...validFiles];
    setFormData(prev => ({ ...prev, images: newImages }));
    validateField('images', newImages);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    validateField('images', newImages);
  };

  const validateForm = () => {
    const fields = ['category', 'item_name', 'color', 'location', 'date_lost', 'description'];
    fields.forEach(field => {
      validateField(field, formData[field]);
    });
    
    if (formData.location === 'Other (Please Specify)') {
      validateField('other_location', formData.other_location);
    }
    
    if (formData.location === 'Not Sure') {
      validateField('not_sure_location_description', formData.not_sure_location_description);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('item_name', formData.item_name);
      submitData.append('brand', formData.brand);
      submitData.append('color', formData.color);
      
      let location = formData.location;
      if (formData.location === 'Other (Please Specify)') {
        location = formData.other_location;
      } else if (formData.location === 'Not Sure') {
        location = `Not Sure: ${formData.not_sure_location_description}`;
      }
      
      submitData.append('location', location);
      submitData.append('date_lost', formData.date_lost);
      submitData.append('description', formData.description);
      submitData.append('additional_info', formData.additional_info);
      
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await itemsAPI.submitLostItem(submitData);
      
      setSubmittedData({
        ...formData,
        reference_id: response.data.reference_id || `LST-${Date.now()}`,
        contact_number: user?.contact_number || user?.phone || '+94 77 987 6543',
        matches_found: response.data.matches_found || false,
        matches: response.data.matches || [],
        similarity_score: response.data.matches?.[0]?.similarity_score || 0
      });
      
      setMatchFound(response.data.matches_found || false);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to submit lost item report' });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#EFF6FF',
      padding: '20px',
      fontFamily: 'Calibri, sans-serif'
    },
    header: {
      maxWidth: '800px',
      margin: '0 auto 30px',
      textAlign: 'center'
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
      margin: '0 0 10px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      fontSize: '18px',
      color: '#6B7280',
      margin: '0 0 8px 0'
    },
    searchNote: {
      fontSize: '16px',
      color: '#03045E',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    form: {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #E5E7EB'
    },
    fieldGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    required: {
      color: '#EF4444'
    },
    optional: {
      color: '#6B7280',
      fontSize: '14px',
      fontWeight: 'normal'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#EF4444'
    },
    inputSuccess: {
      borderColor: '#10B981'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      resize: 'vertical'
    },
    textareaLarge: {
      minHeight: '140px'
    },
    textareaSmall: {
      minHeight: '100px'
    },
    uploadArea: {
      border: '2px dashed #D1D5DB',
      borderRadius: '12px',
      padding: '30px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      backgroundColor: '#F9FAFB',
      opacity: '0.8'
    },
    imagePreview: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '12px',
      marginTop: '16px'
    },
    imageItem: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '1'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    deleteButton: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      background: '#EF4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    error: {
      color: '#EF4444',
      fontSize: '14px',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    helper: {
      color: '#6B7280',
      fontSize: '14px',
      marginTop: '4px'
    },
    success: {
      color: '#10B981',
      fontSize: '14px',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    charCounter: {
      textAlign: 'right',
      fontSize: '14px',
      color: '#6B7280',
      marginTop: '4px'
    },
    importantNote: {
      background: '#FEF3C7',
      border: '1px solid #F59E0B',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '8px',
      fontSize: '14px',
      color: '#92400E'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end',
      marginTop: '40px'
    },
    cancelButton: {
      padding: '12px 24px',
      border: '2px solid #D1D5DB',
      borderRadius: '8px',
      background: 'transparent',
      color: '#374151',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    submitButton: {
      padding: '12px 32px',
      border: 'none',
      borderRadius: '8px',
      background: '#03045E',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    submitButtonDisabled: {
      background: '#9CA3AF',
      cursor: 'not-allowed'
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
      padding: '40px',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    readOnlyField: {
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
      cursor: 'not-allowed'
    }
  };

  if (showSuccess) {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          {matchFound ? (
            // Match Found Success Modal
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <h2 style={{ color: '#10B981', marginBottom: '16px' }}>GREAT NEWS!</h2>
              <h3 style={{ color: '#03045E', marginBottom: '20px' }}>Potential Match Found!</h3>
              <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                Someone has reported finding an item that matches your description!
              </p>
              
              <div style={{ textAlign: 'left', background: '#F9FAFB', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>📋 YOUR ITEM</h3>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• {submittedData?.item_name} {submittedData?.brand && `(${submittedData.brand})`}</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• {submittedData?.color} color</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Lost at: {submittedData?.location}</p>
              </div>

              <div style={{ textAlign: 'left', background: '#EFF6FF', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>🎯 MATCH DETAILS</h3>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Similarity Score: {Math.round(submittedData?.similarity_score || 87)}%</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Found at: Library</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Status: Pending Verification</p>
              </div>

              <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#92400E' }}>✅ NEXT STEP: Ownership Verification</h3>
                <p style={{ margin: '0', color: '#92400E', fontSize: '14px' }}>
                  To confirm this is your item, please answer verification questions based on details only the real owner would know.
                </p>
              </div>

              <p style={{ color: '#6B7280', marginBottom: '8px' }}>📧 Sending questions to your contact right now!</p>
              <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '20px' }}>Reference: {submittedData?.reference_id}</p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate('/verification/1')}
                  style={{ ...styles.submitButton, flex: 1 }}
                >
                  Answer Questions Now
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  style={{ ...styles.cancelButton, flex: 1 }}
                >
                  View Later
                </button>
              </div>
            </>
          ) : (
            // No Match Found Success Modal
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#10B981', marginBottom: '16px' }}>Report Submitted Successfully!</h2>
              <p style={{ color: '#03045E', marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
                We're searching for your item!
              </p>
              
              <div style={{ textAlign: 'left', background: '#F9FAFB', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>📋 YOUR ITEM</h3>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Item: {submittedData?.item_name}</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Brand: {submittedData?.brand || 'Not specified'}</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Color: {submittedData?.color}</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Location Lost: {submittedData?.location}</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• Date Lost: {new Date(submittedData?.date_lost).toLocaleDateString()}</p>
                <p style={{ margin: '12px 0 4px 0', fontWeight: 'bold', color: '#374151' }}>Reference ID: {submittedData?.reference_id}</p>
              </div>

              <div style={{ textAlign: 'left', background: '#EFF6FF', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>🔍 WHAT HAPPENS NEXT</h3>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• We're checking found items database</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• You'll be notified if match found</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• We'll verify with questions</p>
                <p style={{ margin: '4px 0', color: '#6B7280' }}>• After verification, you get finder's contact</p>
              </div>

              <p style={{ color: '#6B7280', marginBottom: '8px' }}>📱 Keep an eye on your phone!</p>
              <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '20px' }}>We'll notify you at: {submittedData?.contact_number}</p>
              
              <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ margin: 0, color: '#92400E' }}>💡 TIP: Check "My Lost Items" daily for updates</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate('/dashboard')}
                  style={{ ...styles.cancelButton, flex: 1 }}
                >
                  View My Lost Items
                </button>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    setFormData({
                      category: '',
                      item_name: '',
                      brand: '',
                      color: '',
                      location: '',
                      other_location: '',
                      not_sure_location_description: '',
                      date_lost: new Date().toISOString().split('T')[0],
                      description: '',
                      additional_info: '',
                      images: []
                    });
                    setErrors({});
                  }}
                  style={{ ...styles.submitButton, flex: 1 }}
                >
                  Report Another
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: '#EFF6FF', padding: 20, fontFamily: 'Inter, sans-serif'}}>
      <div style={{maxWidth: 800, margin: '0 auto'}}>
        <div style={{marginBottom: 30}}>
          <button 
            style={{background: 'none', border: 'none', color: '#03045E', fontSize: 16, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8}}
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </button>
          <h1 style={{fontSize: 32, fontWeight: '800', margin: '0 0 10px 0'}}>Report Lost Item</h1>
          <p style={{fontSize: 18, color: '#666', margin: '0 0 8px 0'}}>We're here to help you find your item!</p>
          <p style={{fontSize: 16, color: '#03045E', margin: 0, display: 'flex', alignItems: 'center', gap: 8}}>🔍 We'll search our database for matches</p>
        </div>

        <form style={{background: 'white', borderRadius: 16, padding: 40, boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>BASIC INFORMATION</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Item Category <span style={styles.required}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                ...styles.select,
                ...(errors.category ? styles.inputError : {}),
                ...(formData.category && !errors.category ? styles.inputSuccess : {})
              }}
            >
              <option value="">What type of item did you lose?</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <div style={styles.error}>⚠️ {errors.category}</div>}
            {formData.category && !errors.category && <div style={styles.success}>✓ Great! That helps!</div>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Item Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="e.g., iPhone 12, Black Backpack, Student ID"
              style={{
                ...styles.input,
                ...(errors.item_name ? styles.inputError : {}),
                ...(formData.item_name && !errors.item_name ? styles.inputSuccess : {})
              }}
            />
            {errors.item_name && <div style={styles.error}>⚠️ {errors.item_name}</div>}
            {formData.item_name && !errors.item_name && <div style={styles.success}>✓ Perfect!</div>}
            <div style={styles.helper}>Be as specific as possible</div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Brand <span style={styles.optional}>(Optional)</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Apple, Nike, Samsung (if you remember)"
              style={{
                ...styles.input,
                ...(errors.brand ? styles.inputError : {})
              }}
            />
            {errors.brand && <div style={styles.error}>⚠️ {errors.brand}</div>}
            <div style={styles.helper}>Leave blank if you don't remember</div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Color <span style={styles.required}>*</span>
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              style={{
                ...styles.select,
                ...(errors.color ? styles.inputError : {}),
                ...(formData.color && !errors.color ? styles.inputSuccess : {})
              }}
            >
              <option value="">Select color (approximate is fine)</option>
              {colors.map(color => (
                <option key={color.value} value={color.value}>
                  {color.value}
                </option>
              ))}
            </select>
            {errors.color && <div style={styles.error}>⚠️ {errors.color}</div>}
            {formData.color && !errors.color && <div style={styles.success}>✓ That helps!</div>}
            <div style={styles.helper}>Choose the closest match if not sure</div>
          </div>
        </div>

        {/* Where & When */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>WHERE & WHEN</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Where did you lose it? <span style={styles.required}>*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              style={{
                ...styles.select,
                ...(errors.location ? styles.inputError : {}),
                ...(formData.location && !errors.location ? styles.inputSuccess : {})
              }}
            >
              <option value="">Select location (approximate is okay)</option>
              {locations.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.location && <div style={styles.error}>⚠️ {errors.location}</div>}
            {formData.location && !errors.location && <div style={styles.success}>✓ Good!</div>}
          </div>

          {formData.location === 'Not Sure' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Describe where you think you might have lost it <span style={styles.required}>*</span>
              </label>
              <textarea
                name="not_sure_location_description"
                value={formData.not_sure_location_description}
                onChange={handleInputChange}
                placeholder="E.g., Somewhere between library and cafeteria"
                style={{
                  ...styles.textarea,
                  ...styles.textareaSmall,
                  ...(errors.not_sure_location_description ? styles.inputError : {}),
                  ...(formData.not_sure_location_description && !errors.not_sure_location_description ? styles.inputSuccess : {})
                }}
              />
              {errors.not_sure_location_description && <div style={styles.error}>⚠️ {errors.not_sure_location_description}</div>}
              {formData.not_sure_location_description && !errors.not_sure_location_description && <div style={styles.success}>✓ That helps narrow it down!</div>}
            </div>
          )}

          {formData.location === 'Other (Please Specify)' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Specify Location <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="other_location"
                value={formData.other_location}
                onChange={handleInputChange}
                placeholder="Enter approximate location"
                style={{
                  ...styles.input,
                  ...(errors.other_location ? styles.inputError : {}),
                  ...(formData.other_location && !errors.other_location ? styles.inputSuccess : {})
                }}
              />
              {errors.other_location && <div style={styles.error}>⚠️ {errors.other_location}</div>}
              {formData.other_location && !errors.other_location && <div style={styles.success}>✓ Perfect!</div>}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              When did you lose it? <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="date_lost"
              value={formData.date_lost}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              style={{
                ...styles.input,
                ...(errors.date_lost ? styles.inputError : {}),
                ...(formData.date_lost && !errors.date_lost ? styles.inputSuccess : {})
              }}
            />
            {errors.date_lost && <div style={styles.error}>⚠️ {errors.date_lost}</div>}
            {formData.date_lost && !errors.date_lost && <div style={styles.success}>✓ Got it!</div>}
            <div style={styles.helper}>Approximate date is fine if you're not sure</div>
            <div style={styles.helper}>💡 Choose the last day you remember having it</div>
          </div>
        </div>

        {/* Visual Reference */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>VISUAL REFERENCE (Optional)</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Upload Photos <span style={styles.optional}>(Optional)</span>
            </label>
            <div 
              style={{
                ...styles.uploadArea,
                ...(errors.images ? { borderColor: '#EF4444' } : {})
              }}
              onClick={() => document.getElementById('lostImageInput').click()}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📷</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6B7280' }}>
                Click to upload or drag and drop
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9CA3AF' }}>
                JPG, PNG (Max 5MB each) • {formData.images.length} of 5 photos
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                Optional - Upload if you have photos of similar item, receipt, or any reference
              </p>
            </div>
            <input
              id="lostImageInput"
              type="file"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {errors.images && <div style={styles.error}>⚠️ {errors.images}</div>}
            {formData.images.length > 0 && (
              <div style={styles.success}>✓ {formData.images.length} photo{formData.images.length > 1 ? 's' : ''} uploaded</div>
            )}
            <div style={styles.helper}>Most people don't have photos of lost items - that's okay!</div>
            
            {formData.images.length > 0 && (
              <div style={styles.imagePreview}>
                {formData.images.map((image, index) => (
                  <div key={index} style={styles.imageItem}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      style={styles.image}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={styles.deleteButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ownership Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>OWNERSHIP DETAILS (Important!)</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Describe Your Item in Detail <span style={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item in detail: unique features, markings, scratches, serial numbers, contents, accessories, or anything that proves you're the real owner. Include details ONLY YOU would know. The more specific you are, the better we can verify ownership."
              style={{
                ...styles.textarea,
                ...styles.textareaLarge,
                ...(errors.description ? styles.inputError : {}),
                ...(formData.description && !errors.description ? styles.inputSuccess : {})
              }}
            />
            {errors.description && <div style={styles.error}>⚠️ {errors.description}</div>}
            {formData.description && !errors.description && <div style={styles.success}>✓ Excellent details!</div>}
            <div style={styles.charCounter}>
              {formData.description.length}/500 characters
            </div>
            <div style={styles.helper}>🔐 These details will be used to verify you're the real owner</div>
            <div style={styles.helper}>💡 Include unique features only YOU would know</div>
            <div style={styles.importantNote}>
              ⚠️ Be very specific - this helps us verify you're the real owner
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Additional Information <span style={styles.optional}>(Recommended)</span>
            </label>
            <textarea
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              placeholder="Where were you before losing it? What were you doing? When did you last see it? Any other helpful context?"
              style={{
                ...styles.textarea,
                ...styles.textareaSmall,
                ...(errors.additional_info ? styles.inputError : {})
              }}
            />
            {errors.additional_info && <div style={styles.error}>⚠️ {errors.additional_info}</div>}
            <div style={styles.charCounter}>
              {formData.additional_info.length}/300 characters
            </div>
            <div style={styles.helper}>💡 Context helps us match your item faster</div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>CONTACT INFORMATION</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Your Contact Number
            </label>
            <input
              type="text"
              value={user?.contact_number || user?.phone || '+94 77 987 6543'}
              readOnly
              style={{
                ...styles.input,
                ...styles.readOnlyField
              }}
            />
            <div style={styles.helper}>We'll notify you at this number if we find a match</div>
          </div>
        </div>

        {errors.submit && (
          <div style={{ ...styles.error, marginBottom: '20px', fontSize: '16px' }}>
            ⚠️ {errors.submit}
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
          >
            {loading ? 'Searching...' : (
              <>
                🔍 Search for My Item
              </>
            )}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default LostItemForm;