import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAdmin, updateAdmin, getAdminById, getAdminPhoto } from '../Services/AdminService';
import { toast } from 'react-toastify';

const AdminForm = () => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(encryptedId);

  const initialFormState = {
    fname: '',
    lname: '',
    email: '',
    gender: 'Male',
    password: '',
    age: '',
    phone: '',
    roles: 'admin',
    image: null,
    imagePreview: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadAdminData = async () => {
      if (!isEditMode) return;

      try {
        const [admin, photoBlob] = await Promise.all([
          getAdminById(encryptedId),
          getAdminPhoto(encryptedId)
        ]);

        setFormData({
          ...admin,
          password: '', 
          image: null,
          imagePreview: URL.createObjectURL(photoBlob)
        });
      } catch (error) {
        toast.error(error.message);
        navigate('admin/ad');
      }
    };

    loadAdminData();
  }, [encryptedId, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            image: files[0],
            imagePreview: reader.result
          }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formPayload = new FormData();
    const { password, image, imagePreview, ...rest } = formData;

    Object.entries(rest).forEach(([key, value]) => {
      formPayload.append(key, value);
    });

    if (password) formPayload.append('password', password);
    if (image) formPayload.append('image', image);

    try {
      if (isEditMode) {
        await updateAdmin(encryptedId, formPayload);
        toast.success('Admin updated successfully!');
      } else {
        await createAdmin(formPayload);
        toast.success('Admin created successfully!');
      }
      navigate('admin/ad');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-form container">
      <h2>{isEditMode ? 'Edit Admin' : 'Create New Admin'}</h2>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!isEditMode && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="lab">Lab Technician</option>
            </select>
          </div>

          <div className="form-group image-upload">
            <label>Profile Photo</label>
            <div className="image-preview">
              {formData.imagePreview ? (
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  className="preview-image"
                />
              ) : (
                <div className="placeholder">No image selected</div>
              )}
            </div>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="file-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : isEditMode ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            className="btn secondary-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;