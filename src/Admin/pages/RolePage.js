import React from 'react';
import AdminRolesTable from './RoleTable';
import { useNavigate } from 'react-router-dom';

const AdminRolesPage = () => {
  const navigate = useNavigate();

  const handleEdit = (encryptedId) => {
    navigate(`/admin-roles/edit/${encryptedId}`);
  };

  const handleView = (encryptedId) => {
    navigate(`/admin-roles/view/${encryptedId}`);
  };

  return (
    <div>
      <h1>Admin Roles Management</h1>
      <AdminRolesTable 
        onEdit={handleEdit} 
        onView={handleView} 
      />
    </div>
  );
};

export default AdminRolesPage;