import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAdminPhoto, getAdminById } from '../Services/AdminService';
import { decodeId } from './idEncoder';

const AdminDetails = () => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!encryptedId || encryptedId === 'undefined') {
          throw new Error('Invalid admin ID');
        }

      } catch (error) {
        toast.error(error.message);
        navigate('/admin/ad');
      }
    };

    loadData();
  }, [encryptedId, navigate]);

  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!encryptedId) return;

        const id = decodeId(encryptedId);
        const [adminData, photoBlob] = await Promise.all([
          getAdminById(encryptedId), 
          getAdminPhoto(encryptedId)
        ]);

        setAdmin(adminData);
        setPhoto(URL.createObjectURL(photoBlob));
      } catch (error) {
        toast.error(error.message);
        navigate('/admin');
      }
    };

    loadData();
  }, [encryptedId, navigate]);

  if (!admin) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-details container">
      <div className="profile-header">
        {photo && <img src={photo} alt="Admin" className="profile-photo" />}
        <h1>{admin.fname} {admin.lname}</h1>
      </div>
      
      <div className="admin-info">
        <div className="info-item">
          <label>Email:</label>
          <p>{admin.email}</p>
        </div>
        <div className="info-item">
          <label>Phone:</label>
          <p>{admin.phone || 'N/A'}</p>
        </div>
        <div className="info-item">
          <label>Role:</label>
          <p>{admin.roles?.join(', ') || 'No roles specified'}</p>
        </div>
        <div className="info-item">
          <label>Gender:</label>
          <p>{admin.gender}</p>
        </div>
        <div className="info-item">
          <label>Age:</label>
          <p>{admin.age || 'N/A'}</p>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn back-btn"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
};

export default AdminDetails;