import React, { useState, useEffect } from 'react';
import { 
  getAllAdminRoles, 
  deleteAdminRole 
} from '../Services/RoleService'; 

const AdminRolesTable = ({ onEdit, onView }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminRoles();
  }, []);

  const fetchAdminRoles = async () => {
    try {
      const data = await getAllAdminRoles();
      setRoles(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (encryptedId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteAdminRole(encryptedId);
        await fetchAdminRoles(); 
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading roles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Admin ID</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.encryptedId} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{role.adminId}</td>
              <td style={{ padding: '12px' }}>{role.role}</td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => onView(role.encryptedId)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(role.encryptedId)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role.encryptedId)}
                  style={{ cursor: 'pointer', color: 'red' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRolesTable;