import React, { useState } from 'react';
import { useAuth } from '../Pages/AuthPage'; // Adjust path if needed
import Navbar from './Nav';
import Footer from './Footer';
const UpdateUserPhotoPage = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      setMessage('Missing file or user info');
      return;
    }

    const path = user?.role || 'Patient'; // ✅ default fallback
    const formData = new FormData();
    formData.append('Id', user.id);
    formData.append('Path', path);
    formData.append('ImageFile', selectedFile);

    console.log('Uploading photo for:', { id: user.id, path });

    setUploading(true);
    try {
      const response = await fetch('https://physiocareapp.runasp.net/api/v1/Account/update-user-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // ✅ avoid JSON parse error
        throw new Error(errorText || 'Upload failed');
      }

      setMessage('✅ Photo updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <><Navbar />
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">Update Profile Photo</h3>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="form-control mb-3"
      />

      {previewUrl && (
        <div className="mb-3 text-center">
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '10px' }}
          />
        </div>
      )}

      <button
        className="btn btn-primary w-100"
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>

      {message && (
        <div className="alert alert-info mt-3" role="alert">
          {message}
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default UpdateUserPhotoPage;
