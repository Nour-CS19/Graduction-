import React, { useState, useEffect } from 'react';
import { nurseService } from '../Services/NurseService';

const NurseForm = ({ nurse, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    gender: 'male',
    password: '',
    age: '',
    phone: '',
    evaluation: 0,
    photo: null,
    previewPhoto: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (nurse) {
      const loadNurseData = async () => {
        try {
          const fullNurse = await nurseService.getNurseById(nurse.encryptedId);
          const photoBlob = await nurseService.getNursePhoto(nurse.encryptedId);
          
          setFormData({
            ...fullNurse,
            password: '', 
            photo: null,
            previewPhoto: URL.createObjectURL(photoBlob)
          });
        } catch (error) {
          console.error('Error loading nurse data:', error);
          alert('Failed to load nurse data');
        }
      };
      loadNurseData();
    }
  }, [nurse]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.fname.trim()) newErrors.fname = 'First name is required';
    if (!formData.lname.trim()) newErrors.lname = 'Last name is required';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!nurse && !formData.password) newErrors.password = 'Password is required';
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (formData.age < 18 || formData.age > 65) newErrors.age = 'Age must be between 18-65';
    if (formData.evaluation < 0 || formData.evaluation > 5) newErrors.evaluation = 'Evaluation must be 0-5';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'photo') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        photo: file,
        previewPhoto: URL.createObjectURL(file)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const data = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
      if (key === 'photo' && formData[key] instanceof File) {
        data.append(key, formData[key], formData[key].name);
      } else if (formData[key] !== null && key !== 'previewPhoto') {
        data.append(key, formData[key]);
      }
    });

    try {
      if (nurse) {
        await nurseService.updateNurse(nurse.encryptedId, data);
      } else {
        await nurseService.createNurse(data);
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error saving nurse:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-content">
        <h2>{nurse ? 'Edit Nurse' : 'Add New Nurse'}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-grid">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    className={errors.fname ? 'error' : ''}
                  />
                  {errors.fname && <span className="error-message">{errors.fname}</span>}
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    className={errors.lname ? 'error' : ''}
                  />
                  {errors.lname && <span className="error-message">{errors.lname}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="65"
                    className={errors.age ? 'error' : ''}
                  />
                  {errors.age && <span className="error-message">{errors.age}</span>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Security & Evaluation */}
            <div className="form-section">
              <h3>Security & Evaluation</h3>
              <div className="form-row">
                {!nurse && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label>Evaluation</label>
                  <input
                    type="number"
                    name="evaluation"
                    value={formData.evaluation}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="1"
                    className={errors.evaluation ? 'error' : ''}
                  />
                  {errors.evaluation && <span className="error-message">{errors.evaluation}</span>}
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="form-section">
              <h3>Profile Photo</h3>
              <div className="form-row">
                <div className="form-group photo-upload">
                  <label>
                    Upload Photo
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </label>
                  {formData.previewPhoto && (
                    <div className="photo-preview">
                      <img 
                        src={formData.previewPhoto} 
                        alt="Preview" 
                      />
                      <span className="photo-info">
                        {formData.photo?.name || 'Current Photo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurseForm;