/*

import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOperations = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [adminIds, setAdminIds] = useState([]);
  const [newAdminData, setNewAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [updateAdminData, setUpdateAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [updateType, setUpdateType] = useState(''); // 'partial' or 'full'

  // Fetch all admins
  const fetchAllAdmins = async () => {
    try {
      const response = await axios.get('/api/v1/Admins/GetAll');
      setAdmins(response.data);
    } catch (err) {
      console.error('Error fetching all admins:', err.message);
      alert('Error fetching admins!');
    }
  };

  // Create a new admin
  const createAdmin = async () => {
    const formData = new FormData();
    formData.append('fname', newAdminData.fname);
    formData.append('lname', newAdminData.lname);
    formData.append('email', newAdminData.email);
    formData.append('password', newAdminData.password);
    formData.append('phone', newAdminData.phone);
    formData.append('age', newAdminData.age);
    formData.append('gender', newAdminData.gender);
    formData.append('photo', newAdminData.photo);

    try {
      await axios.post('/api/v1/Admins', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Admin created successfully!');
      fetchAllAdmins();
      resetCreateForm(); // Reset the form after creating an admin
    } catch (err) {
      console.error('Error creating admin:', err.message);
      alert('Error creating admin!');
    }
  };

  // Reset create admin form
  const resetCreateForm = () => {
    setNewAdminData({
      fname: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      photo: null,
    });
    setUpdateType('');
  };

  // Fetch an admin by ID
  const fetchAdminById = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    try {
      const response = await axios.get(`/api/v1/Admins/GetById?id=${adminId}`);
      setSelectedAdmin(response.data);
    } catch (err) {
      console.error('Error fetching admin by ID:', err.message);
      alert('Error fetching admin by ID!');
    }
  };

  // Full update admin by ID
  const handleFullUpdate = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    try {
      await axios.put(`/api/v1/Admins/${adminId}`, updateAdminData);
      alert('Admin updated successfully!');
      fetchAllAdmins();
      resetCreateForm(); // Reset the form after updating
    } catch (err) {
      console.error('Error updating admin:', err.message);
      alert('Error updating admin!');
    }
  };

  // Partial update admin by ID (only email)
  const handlePartialUpdate = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    const partialUpdateData = { email: updateAdminData.email };

    try {
      await axios.patch(`/api/v1/Admins/${adminId}`, partialUpdateData);
      alert('Admin partially updated successfully!');
      fetchAllAdmins();
      resetCreateForm(); // Reset the form after updating
    } catch (err) {
      console.error('Error partially updating admin:', err.message);
      alert('Error partially updating admin!');
    }
  };

  // Delete admin by ID
  const deleteAdmin = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    try {
      await axios.delete(`/api/v1/Admins/${adminId}`);
      alert('Admin deleted successfully!');
      fetchAllAdmins();
      resetCreateForm(); // Reset the form after deleting
    } catch (err) {
      console.error('Error deleting admin:', err.message);
      alert('Error deleting admin!');
    }
  };

  // Fetch admins by multiple IDs
  const fetchAdminsByIds = async () => {
    if (adminIds.length === 0) {
      alert('Please provide admin IDs!');
      return;
    }

    try {
      const response = await axios.post('/api/v1/Admins/GetByIds', { ids: adminIds });
      setAdmins(response.data);
    } catch (err) {
      console.error('Error fetching admins by IDs:', err.message);
      alert('Error fetching admins by IDs!');
    }
  };

  // Create collections for admins
  const createAdminCollections = async () => {
    if (adminIds.length === 0) {
      alert('Please provide admin IDs for collections!');
      return;
    }

    try {
      await axios.post('/api/v1/Admins/CreateCollections', { adminIds });
      alert('Collections created successfully!');
    } catch (err) {
      console.error('Error creating collections:', err.message);
      alert('Error creating collections!');
    }
  };

  useEffect(() => {
    fetchAllAdmins(); // Fetch all admins on component mount
  }, []);

   





/*

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Admin.css';
const AdminOperations = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [newAdminData, setNewAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [updateAdminData, setUpdateAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [updateType, setUpdateType] = useState('');

  // Fetch all admins
  const fetchAllAdmins = async () => {
    try {
      const response = await axios.get('/api/v1/Admins/GetAll');
      setAdmins(response.data);
    } catch (err) {
      console.error('Error fetching all admins:', err.message);
      alert('Error fetching admins!');
    }
  };

  // Handle Edit button click
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setModalType('edit');
    setShowModal(true);
  };

  // Handle Delete button click
  const handleDelete = (adminId) => {
    setAdminId(adminId);
    setModalType('delete');
    setShowModal(true);
  };

  // Handle Create Admin button click
  const handleCreate = () => {
    setModalType('create');
    setShowModal(true);
  };

  const handleFullUpdate = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    const formData = new FormData();
    formData.append('fname', updateAdminData.fname);
    formData.append('lname', updateAdminData.lname);
    formData.append('email', updateAdminData.email);
    formData.append('password', updateAdminData.password);
    formData.append('phone', updateAdminData.phone);
    formData.append('age', updateAdminData.age);
    formData.append('gender', updateAdminData.gender);
    if (updateAdminData.photo) {
      formData.append('photo', updateAdminData.photo);
    }

    try {
      await axios.put(`/api/v1/Admins/${adminId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Admin updated successfully!');
      fetchAllAdmins();
      resetForm();
    } catch (err) {
      console.error('Error updating admin:', err.message);
      alert('Error updating admin!');
    }
  };

  const handlePartialUpdate = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    const partialUpdateData = { email: updateAdminData.email };

    try {
      await axios.patch(`/api/v1/Admins/${adminId}`, partialUpdateData);
      alert('Admin partially updated successfully!');
      fetchAllAdmins();
      resetForm();
    } catch (err) {
      console.error('Error partially updating admin:', err.message);
      alert('Error partially updating admin!');
    }
  };

  const deleteAdmin = async () => {
    if (!adminId) {
      alert('Please provide an ID!');
      return;
    }

    try {
      await axios.delete(`/api/v1/Admins/${adminId}`);
      alert('Admin deleted successfully!');
      fetchAllAdmins();
      setShowModal(false); // Close modal after delete
    } catch (err) {
      console.error('Error deleting admin:', err.message);
      alert('Error deleting admin!');
    }
  };

  const createAdmin = async () => {
    const formData = new FormData();
    formData.append('fname', newAdminData.fname);
    formData.append('lname', newAdminData.lname);
    formData.append('email', newAdminData.email);
    formData.append('password', newAdminData.password);
    formData.append('phone', newAdminData.phone);
    formData.append('age', newAdminData.age);
    formData.append('gender', newAdminData.gender);
    if (newAdminData.photo) {
      formData.append('photo', newAdminData.photo);
    }

    try {
      await axios.post('/api/v1/Admins', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Admin created successfully!');
      fetchAllAdmins();
      resetForm();
    } catch (err) {
      console.error('Error creating admin:', err.message);
      alert('Error creating admin!');
    }
  };

  const resetForm = () => {
    setNewAdminData({
      fname: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      photo: null,
    });
    setUpdateAdminData({
      fname: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      photo: null,
    });
    setAdminId('');
    setModalType('');
  };

  useEffect(() => {
    fetchAllAdmins();
  }, []);

  return (
    <div>
      <h3>Admins List</h3>
      <button className="btn btn-success" onClick={handleCreate}>Create New Admin</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.id}</td>
              <td>{admin.fname}</td>
              <td>{admin.lname}</td>
              <td>{admin.email}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handleEdit(admin)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(admin.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {}
      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <h4>{modalType === 'create' ? 'Create Admin' : modalType === 'edit' ? 'Edit Admin' : 'Delete Admin'}</h4>

            {modalType === 'create' && (
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={newAdminData.fname}
                  onChange={(e) => setNewAdminData({ ...newAdminData, fname: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newAdminData.lname}
                  onChange={(e) => setNewAdminData({ ...newAdminData, lname: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={newAdminData.age}
                  onChange={(e) => setNewAdminData({ ...newAdminData, age: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Gender"
                  value={newAdminData.gender}
                  onChange={(e) => setNewAdminData({ ...newAdminData, gender: e.target.value })}
                />
                <input
                  type="file"
                  onChange={(e) => setNewAdminData({ ...newAdminData, photo: e.target.files[0] })}
                />
                <button className="btn btn-success" onClick={createAdmin}>Create Admin</button>
              </div>
            )}

            {modalType === 'edit' && (
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={updateAdminData.fname}
                  onChange={(e) => setUpdateAdminData({ ...updateAdminData, fname: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={updateAdminData.lname}
                  onChange={(e) => setUpdateAdminData({ ...updateAdminData, lname: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={updateAdminData.email}
                  onChange={(e) => setUpdateAdminData({ ...updateAdminData, email: e.target.value })}
                />
                <button className="btn btn-secondary" onClick={handlePartialUpdate}>Partial Update</button>
                <button className="btn btn-primary" onClick={handleFullUpdate}>Full Update</button>
              </div>
            )}

            {modalType === 'delete' && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Admin ID to Delete"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
                <button className="btn btn-danger" onClick={deleteAdmin}>Delete Admin</button>
              </div>
            )}

            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOperations;


*/


/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Admin.css';

const AdminOperations = () => {
  const [admins, setAdmins] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [adminIds, setAdminIds] = useState([]); // Store array of IDs for multiple fetches
  const [newAdminData, setNewAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [updateAdminData, setUpdateAdminData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    photo: null,
  });
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const AdminCreateCollections = () => {
    const [admins, setAdmins] = useState([
      { fname: '', lname: '', email: '', password: '', phone: '', age: '', gender: '', photo: '' },
    ]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
  
    // Handle change for dynamic form fields
    const handleChange = (index, field, value) => {
      const updatedAdmins = [...admins];
      updatedAdmins[index][field] = value;
      setAdmins(updatedAdmins);
    };
  
    // Add a new admin field group
    const addAdmin = () => {
      setAdmins([
        ...admins,
        { fname: '', lname: '', email: '', password: '', phone: '', age: '', gender: '', photo: '' },
      ]);
    };
  
    // Remove an admin field group
    const removeAdmin = (index) => {
      const updatedAdmins = admins.filter((_, i) => i !== index);
      setAdmins(updatedAdmins);
    };
  
    // Submit the admin collection
    const handleSubmit = async () => {
      try {
        const formData = new FormData();
        admins.forEach((admin, index) => {
          Object.keys(admin).forEach((key) => {
            if (key === 'photo') {
              formData.append(`admins[${index}][${key}]`, admin[key]);
            } else {
              formData.append(`admins[${index}][${key}]`, admin[key]);
            }
          });
        });
  
        const response = await axios.post('/api/v1/Admins/CreateCollections', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage(response.data.message);
        setError('');
        setAdmins([{ fname: '', lname: '', email: '', password: '', phone: '', age: '', gender: '', photo: '' }]);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setMessage('');
      }
    };
  
  // Fetch all admins
  const fetchAllAdmins = async () => {
    try {
      const response = await axios.get('/api/v1/Admins/GetAll');
      setAdmins(response.data);
    } catch (err) {
      console.error('Error fetching all admins:', err.message);
      alert('Error fetching admins!');
    }
  };

  // Fetch a single admin by ID
  const fetchAdminById = async (id) => {
    try {
      const response = await axios.get(`/api/v1/Admins/${id}`);
      setAdmins([response.data]); // Set the array with the single admin
    } catch (err) {
      console.error('Error fetching admin by ID:', err.message);
      alert('Error fetching admin!');
    }
  };

  // Fetch multiple admins by IDs
  const fetchAdminsByIds = async (ids) => {
    try {
      const response = await axios.post('/api/v1/Admins/BatchFetch', { ids });
      setAdmins(response.data); // Set admins with the fetched data
    } catch (err) {
      console.error('Error fetching admins by IDs:', err.message);
      alert('Error fetching admins by IDs!');
    }
  };

  // Create Admin
  const createAdmin = async () => {
    const formData = new FormData();
    formData.append('fname', newAdminData.fname);
    formData.append('lname', newAdminData.lname);
    formData.append('email', newAdminData.email);
    formData.append('password', newAdminData.password);
    formData.append('phone', newAdminData.phone);
    formData.append('age', newAdminData.age);
    formData.append('gender', newAdminData.gender);
    if (newAdminData.photo) {
      formData.append('photo', newAdminData.photo);
    }

    try {
      await axios.post('/api/v1/Admins', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Admin created successfully!');
      fetchAllAdmins(); // Refresh the list after creating
      resetForm(); // Reset the form after creation
    } catch (err) {
      console.error('Error creating admin:', err.message);
      alert('Error creating admin!');
    }
  };

  // Handle Edit button click
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setModalType('edit');
    setUpdateAdminData(admin); // Pre-populate form with selected admin data
    setActionMessage('You can edit all fields or leave some blank to partially update.');
    setShowModal(true);
  };

  // Full Update Admin (Update all fields)
  const handleFullUpdate = async () => {
    if (!selectedAdmin?.id) {
      alert('No admin selected for update!');
      return;
    }

    const formData = new FormData();
    formData.append('fname', updateAdminData.fname);
    formData.append('lname', updateAdminData.lname);
    formData.append('email', updateAdminData.email);
    formData.append('password', updateAdminData.password);
    formData.append('phone', updateAdminData.phone);
    formData.append('age', updateAdminData.age);
    formData.append('gender', updateAdminData.gender);
    if (updateAdminData.photo) {
      formData.append('photo', updateAdminData.photo);
    }

    try {
      await axios.put(`/api/v1/Admins/${selectedAdmin.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Admin updated successfully!');
      fetchAllAdmins();
      setShowModal(false); // Close modal after update
    } catch (err) {
      console.error('Error updating admin:', err.message);
      alert('Error updating admin!');
    }
  };

  // Delete Admin
  const deleteAdmin = async () => {
    if (!adminId) {
      alert('Please provide an ID to delete!');
      return;
    }

    try {
      await axios.delete(`/api/v1/Admins/${adminId}`);
      alert('Admin deleted successfully!');
      fetchAllAdmins(); // Refresh the list after deleting
      setShowModal(false); // Close modal after delete
    } catch (err) {
      console.error('Error deleting admin:', err.message);
      alert('Error deleting admin!');
    }
  };

  // Reset Form Data
  const resetForm = () => {
    setNewAdminData({
      fname: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      photo: null,
    });
    setUpdateAdminData({
      fname: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: '',
      photo: null,
    });
    setAdminId('');
    setModalType('');
    setActionMessage('');
  };

  // Fetch Admins when component mounts
  useEffect(() => {
    fetchAllAdmins();
  }, []);

}
  return (
    <div>
    <h3>Admins List</h3>
  
    {}
    <div className="buttons-container">
      <button className="btn btn-info" onClick={() => { setModalType('create'); setActionMessage('Fill in all fields to create a new admin.'); setShowModal(true); }}>Create Admin</button>
      <button className="btn btn-primary" onClick={() => { setModalType('fetch'); setActionMessage('Enter the admin ID to fetch.'); setShowModal(true); }}>Fetch Admin by ID</button>
      <button className="btn btn-info" onClick={() => { setModalType('batch-fetch'); setActionMessage('Enter multiple IDs separated by commas to fetch admins.'); setShowModal(true); }}>Fetch Admins by IDs</button>
      <button className="btn btn-danger" onClick={() => { setModalType('delete'); setActionMessage('Enter the admin ID to delete.'); setShowModal(true); }}>Delete Admin</button>
    </div>
  
    {}
    <table className="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id}>
            <td>{admin.id}</td>
            <td>{admin.fname}</td>
            <td>{admin.lname}</td>
            <td>{admin.email}</td>
            <td>
  <div className="d-flex gap-2">
    <button className="btn btn-primary" onClick={() => handleEdit(admin)}>Edit</button>
    <button className="btn btn-danger" onClick={() => { setAdminId(admin.id); setShowModal(true); setModalType('delete'); }}>Delete</button>
  </div>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  
    {}
    {showModal && (
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-content">
          <h4>{modalType === 'create' ? 'Create Admin' : modalType === 'edit' ? 'Edit Admin' : modalType === 'fetch' ? 'Fetch Admin by ID' : modalType === 'batch-fetch' ? 'Fetch Admins by IDs' : 'Delete Admin'}</h4>
  
          <p>{actionMessage}</p>
  
          {}
          {modalType === 'create' && (
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={newAdminData.fname}
                onChange={(e) => setNewAdminData({ ...newAdminData, fname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newAdminData.lname}
                onChange={(e) => setNewAdminData({ ...newAdminData, lname: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={newAdminData.phone}
                onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
              />
              <input
                type="number"
                placeholder="Age"
                value={newAdminData.age}
                onChange={(e) => setNewAdminData({ ...newAdminData, age: e.target.value })}
              />
              <input
                type="text"
                placeholder="Gender"
                value={newAdminData.gender}
                onChange={(e) => setNewAdminData({ ...newAdminData, gender: e.target.value })}
              />
              <input
                type="file"
                onChange={(e) => setNewAdminData({ ...newAdminData, photo: e.target.files[0] })}
              />
              <button className="btn btn-success" onClick={createAdmin}>Create Admin</button>
            </div>
          )}
  
          {}
          {modalType === 'fetch' && (
            <div>
              <input
                type="number"
                placeholder="Enter Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => fetchAdminById(adminId)}>Fetch Admin</button>
            </div>
          )}
  
          {}
          {modalType === 'batch-fetch' && (
            <div>
              <input
                type="text"
                placeholder="Enter Admin IDs (comma separated)"
                value={adminIds}
                onChange={(e) => setAdminIds(e.target.value.split(',').map(id => id.trim()))}
              />
              <button className="btn btn-info" onClick={() => fetchAdminsByIds(adminIds)}>Fetch Admins</button>
            </div>
          )}
  
          {}
          {modalType === 'delete' && (
            <div>
              <input
                type="number"
                placeholder="Enter Admin ID to delete"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
              <button className="btn btn-danger" onClick={deleteAdmin}>Delete</button>
            </div>
          )}
  
          {}
          {modalType === 'edit' && (
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={updateAdminData.fname}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, fname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={updateAdminData.lname}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, lname: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={updateAdminData.email}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={updateAdminData.password}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={updateAdminData.phone}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, phone: e.target.value })}
              />
              <input
                type="number"
                placeholder="Age"
                value={updateAdminData.age}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, age: e.target.value })}
              />
              <input
                type="text"
                placeholder="Gender"
                value={updateAdminData.gender}
                onChange={(e) => setUpdateAdminData({ ...updateAdminData, gender: e.target.value })}
              />
              <button className="btn btn-secondary" onClick={handleFullUpdate}>Update Admin</button>
            </div>
          )}
  
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
        </div>
      </div>
    )}
  </div>
  <div className="admin-create-collections">
  <h2>Create Admin Collections</h2>
  {message && <p className="success-message">{message}</p>}
  {error && <p className="error-message">{error}</p>}

  <div className="admins-form">
    {admins.map((admin, index) => (
      <div key={index} className="admin-form">
        <h4>Admin {index + 1}</h4>
        <input
          type="text"
          placeholder="First Name"
          value={admin.fname}
          onChange={(e) => handleChange(index, 'fname', e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={admin.lname}
          onChange={(e) => handleChange(index, 'lname', e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={admin.email}
          onChange={(e) => handleChange(index, 'email', e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={admin.password}
          onChange={(e) => handleChange(index, 'password', e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone"
          value={admin.phone}
          onChange={(e) => handleChange(index, 'phone', e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={admin.age}
          onChange={(e) => handleChange(index, 'age', e.target.value)}
        />
        <input
          type="text"
          placeholder="Gender"
          value={admin.gender}
          onChange={(e) => handleChange(index, 'gender', e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => handleChange(index, 'photo', e.target.files[0])}
        />
        {admins.length > 1 && (
          <button type="button" className="remove-btn" onClick={() => removeAdmin(index)}>
            Remove
          </button>
        )}
      </div>
    ))}
  </div>

  <button type="button" className="add-btn" onClick={addAdmin}>
    Add Admin
  </button>
  <button type="button" className="submit-btn" onClick={handleSubmit}>
    Submit Admin Collection
  </button>
</div>

};
  
);
};

export default AdminOperations;


*/

/*

import React from 'react';
import AdminOperations from '../Services/AdminService'; // Import the AdminOperations component

const AdminPage = () => {
  return (
    <div className="admin-page-container">
      <h1>Admin Dashboard</h1>
      <AdminOperations />  {}
    </div>
  );
};

export default AdminPage;


*/

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button,
  CircularProgress, Avatar, Typography
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { getAllAdmins, deleteAdmin } from '../Services/AdminService';
import '../css/AdminTable.css';
import PropTypes from 'prop-types';

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const data = await getAllAdmins();
        setAdmins(data);
        setError(null);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, [navigate]);

  AdminTable.propTypes = {
    admins: PropTypes.arrayOf(
      PropTypes.shape({
        encryptedId: PropTypes.string.isRequired,
        id: PropTypes.string,
        fname: PropTypes.string.isRequired,
        lname: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        roles: PropTypes.arrayOf(PropTypes.string),
        phone: PropTypes.string,
        imageUrl: PropTypes.string
      })
    ).isRequired
  };
  
  const handleDelete = async (encryptedId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(encryptedId);
        setAdmins(prev => prev.filter(a => a.encryptedId !== encryptedId));
        toast.success('Admin deleted successfully');
      } catch (error) {
        toast.error(`Delete failed: ${error.message}`);
      }
    }
  };
  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress size={60} />
        <Typography variant="body1" mt={2}>Loading admin data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography variant="h6" color="error">
          Error loading admins: {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-table-container container">
      <div className="header-section">
        <Typography variant="h4" gutterBottom>
          Admin Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/create')}
        >
          Add New Admin
        </Button>
      </div>

      <TableContainer component={Paper} className="table-paper">
        <Table sx={{ minWidth: 650 }} aria-label="admin table">
          <TableHead className="table-header">
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <TableRow key={admin.encryptedId} hover>
                  <TableCell>
                    <Avatar
                      src={admin.imageUrl || '/default-avatar.png'}
                      sx={{ width: 45, height: 45 }}
                    />
                  </TableCell>
                  <TableCell>{admin.fname} {admin.lname}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.roles?.join(', ') || 'No roles'}</TableCell>
                  <TableCell>{admin.phone || 'N/A'}</TableCell>
                  <TableCell align="center">
  <div className="action-buttons">
    <Button
      onClick={() => navigate(`/admin/ad/details/${admin.encryptedId}`)}
      sx={{ mr: 1 }}
    >
      View
    </Button>
    <Button
      onClick={() => navigate(`/admin/ad/edit/${admin.encryptedId}`)}

      sx={{ mr: 1 }}
    >
      Edit
    </Button>
    <Button
  startIcon={<Delete />}
  onClick={() => handleDelete(admin.encryptedId)}
  color="error"
>
  Delete
</Button>
  </div>
</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1">No admins found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminTable;