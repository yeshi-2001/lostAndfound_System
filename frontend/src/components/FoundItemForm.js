import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';

const FoundItemForm = ({ token, user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    item_name: '',
    brand: '',
    color: '',
    location: '',
    other_location: '',
    date_found: new Date().toISOString().split('T')[0],
    description: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);


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
    { group: 'Other', options: ['Other (Please Specify)'] }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'category':
        if (!value) newErrors.category = 'Please select a category';
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
        if (!value) newErrors.color = 'Please select a color';
        else delete newErrors.color;
        break;
      case 'location':
        if (!value) newErrors.location = 'Please select a location';
        else delete newErrors.location;
        break;
      case 'other_location':
        if (formData.location === 'Other (Please Specify)' && !value) {
          newErrors.other_location = 'Please specify the location';
        } else delete newErrors.other_location;
        break;
      case 'date_found':
        if (!value) newErrors.date_found = 'Please select a date';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
          if (selectedDate > today) newErrors.date_found = 'Cannot select future dates';
          else if (selectedDate < thirtyDaysAgo) newErrors.date_found = 'Cannot select dates older than 30 days';
          else delete newErrors.date_found;
        }
        break;
      case 'description':
        if (!value) newErrors.description = 'Description is required';
        else if (value.length < 20) newErrors.description = 'Description must be at least 20 characters';
        else if (value.length > 500) newErrors.description = 'Description cannot exceed 500 characters';
        else delete newErrors.description;
        break;
      case 'images':
        if (!value || value.length === 0) newErrors.images = 'Please upload at least 1 photo';
        else if (value.length > 5) newErrors.images = 'Maximum 5 photos allowed';
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
    const fields = ['category', 'item_name', 'color', 'location', 'date_found', 'description', 'images'];
    fields.forEach(field => {
      validateField(field, formData[field]);
    });
    
    if (formData.location === 'Other (Please Specify)') {
      validateField('other_location', formData.other_location);
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
      submitData.append('location', formData.location === 'Other (Please Specify)' ? formData.other_location : formData.location);
      submitData.append('date_found', formData.date_found);
      submitData.append('description', formData.description);
      
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await itemsAPI.submitFoundItem(submitData);
      console.log('API Response:', response); // Debug log
      
      setSubmittedData({
        ...formData,
        reference_id: response.data.reference_id || `FND-${Date.now()}`,
        contact_number: user?.contact_number || user?.phone || '+94 77 123 4567',
        matches_found: response.data.matches_found || false,
        matches: response.data.matches || []
      });
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      setErrors({ submit: error.response?.data?.error || error.message || 'Failed to submit found item' });
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
      margin: 0
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
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#03045E',
      outline: 'none'
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
    colorOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    uploadArea: {
      border: '2px dashed #D1D5DB',
      borderRadius: '12px',
      padding: '40px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      backgroundColor: '#F9FAFB'
    },
    uploadAreaHover: {
      borderColor: '#03045E',
      backgroundColor: '#EFF6FF'
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
      transition: 'background-color 0.2s'
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#10B981', marginBottom: '16px' }}>Item Successfully Reported!</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Thank you for helping our university community!
          </p>
          
          <div style={{ textAlign: 'left', background: '#F9FAFB', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>📋 ITEM DETAILS</h3>
            <p style={{ margin: '4px 0', color: '#6B7280' }}>• Item: {submittedData?.item_name}</p>
            <p style={{ margin: '4px 0', color: '#6B7280' }}>• Brand: {submittedData?.brand || 'Not specified'}</p>
            <p style={{ margin: '4px 0', color: '#6B7280' }}>• Color: {submittedData?.color}</p>
            <p style={{ margin: '4px 0', color: '#6B7280' }}>• Location: {submittedData?.location === 'Other (Please Specify)' ? submittedData?.other_location : submittedData?.location}</p>
            <p style={{ margin: '4px 0', color: '#6B7280' }}>• Date Found: {new Date(submittedData?.date_found).toLocaleDateString()}</p>
            <p style={{ margin: '12px 0 4px 0', fontWeight: 'bold', color: '#374151' }}>Reference ID: {submittedData?.reference_id}</p>
          </div>

          <p style={{ color: '#6B7280', marginBottom: '8px' }}>📱 Confirmation sent to:</p>
          <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '20px' }}>{submittedData?.contact_number}</p>
          
          {submittedData?.matches_found ? (
            <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#03045E' }}>🎯 POTENTIAL MATCHES FOUND!</h3>
              <p style={{ margin: '0', color: '#1F2937', fontSize: '14px' }}>
                We found {submittedData.matches.length} potential match(es). The owners will be notified to verify ownership.
              </p>
            </div>
          ) : (
            <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#92400E' }}>💡 Keep the item safe until verified owner contacts you!</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ ...styles.cancelButton, flex: 1 }}
            >
              View My Found Items
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
                  date_found: new Date().toISOString().split('T')[0],
                  description: '',
                  images: []
                });
                setErrors({});
              }}
              style={{ ...styles.submitButton, flex: 1 }}
            >
              Report Another
            </button>
          </div>
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
          <h1 style={{fontSize: 32, fontWeight: '800', margin: '0 0 10px 0'}}>Report Found Item</h1>
          <p style={{fontSize: 18, color: '#666', margin: 0}}>Help a fellow student find their item</p>
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
              <option value="">Select item category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <div style={styles.error}>⚠️ {errors.category}</div>}
            {formData.category && !errors.category && <div style={styles.success}>✓ Looks good!</div>}
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
            {formData.item_name && !errors.item_name && <div style={styles.success}>✓ Looks good!</div>}
            <div style={styles.helper}>Be specific</div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Brand (Optional)
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Apple, Nike, Samsung"
              style={{
                ...styles.input,
                ...(errors.brand ? styles.inputError : {})
              }}
            />
            {errors.brand && <div style={styles.error}>⚠️ {errors.brand}</div>}
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
              <option value="">Select color</option>
              {colors.map(color => (
                <option key={color.value} value={color.value}>
                  {color.value}
                </option>
              ))}
            </select>
            {errors.color && <div style={styles.error}>⚠️ {errors.color}</div>}
            {formData.color && !errors.color && <div style={styles.success}>✓ Looks good!</div>}
          </div>
        </div>

        {/* Location & Date */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>LOCATION & DATE</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Where did you find it? <span style={styles.required}>*</span>
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
              <option value="">Select location</option>
              {locations.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.location && <div style={styles.error}>⚠️ {errors.location}</div>}
            {formData.location && !errors.location && <div style={styles.success}>✓ Looks good!</div>}
          </div>

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
                placeholder="Enter exact location"
                style={{
                  ...styles.input,
                  ...(errors.other_location ? styles.inputError : {}),
                  ...(formData.other_location && !errors.other_location ? styles.inputSuccess : {})
                }}
              />
              {errors.other_location && <div style={styles.error}>⚠️ {errors.other_location}</div>}
              {formData.other_location && !errors.other_location && <div style={styles.success}>✓ Looks good!</div>}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              When did you find it? <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              name="date_found"
              value={formData.date_found}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              style={{
                ...styles.input,
                ...(errors.date_found ? styles.inputError : {}),
                ...(formData.date_found && !errors.date_found ? styles.inputSuccess : {})
              }}
            />
            {errors.date_found && <div style={styles.error}>⚠️ {errors.date_found}</div>}
            {formData.date_found && !errors.date_found && <div style={styles.success}>✓ Looks good!</div>}
            <div style={styles.helper}>Select the date you found this item</div>
          </div>
        </div>

        {/* Visual Evidence */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>VISUAL EVIDENCE</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Upload Photos <span style={styles.required}>*</span>
            </label>
            <div 
              style={{
                ...styles.uploadArea,
                ...(errors.images ? { borderColor: '#EF4444' } : {}),
                ...(formData.images.length > 0 && !errors.images ? { borderColor: '#10B981' } : {})
              }}
              onClick={() => document.getElementById('imageInput').click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
                Click to upload or drag and drop
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                JPG, PNG (Max 5MB each) • {formData.images.length} of 5 photos
              </p>
            </div>
            <input
              id="imageInput"
              type="file"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {errors.images && <div style={styles.error}>⚠️ {errors.images}</div>}
            {formData.images.length > 0 && !errors.images && (
              <div style={styles.success}>✓ {formData.images.length} photo{formData.images.length > 1 ? 's' : ''} uploaded</div>
            )}
            <div style={styles.helper}>Add 1-5 clear photos of the item from different angles</div>
            
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

        {/* Detailed Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>DETAILED INFORMATION</h3>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Describe the Item <span style={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe any unique features, markings, contents, size, condition, or any other identifying details about the item. The more specific you are, the better we can verify the real owner."
              style={{
                ...styles.textarea,
                ...(errors.description ? styles.inputError : {}),
                ...(formData.description && !errors.description ? styles.inputSuccess : {})
              }}
            />
            {errors.description && <div style={styles.error}>⚠️ {errors.description}</div>}
            {formData.description && !errors.description && <div style={styles.success}>✓ Looks good!</div>}
            <div style={styles.charCounter}>
              {formData.description.length}/500 characters
            </div>
            <div style={styles.helper}>💡 More details help verify the real owner</div>
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
              value={user?.contact_number || user?.phone || '+94 77 123 4567'}
              readOnly
              style={{
                ...styles.input,
                ...styles.readOnlyField
              }}
            />
            <div style={styles.helper}>From your profile</div>
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
            {loading ? 'Submitting...' : 'Submit Found Item'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default FoundItemForm;