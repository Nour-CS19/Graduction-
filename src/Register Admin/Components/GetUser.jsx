import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Pages/AuthPage'; // Assuming this is where useAuth is defined

const UserManagement = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = ['Admin', 'Doctor', 'Patient', 'Laboratory', 'Nurse'];

  // Fetch users by role with authorization
  const fetchUsers = async (role) => {
    setLoading(true);
    setError('');
    const accessToken = user?.accessToken || localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`https://physiocareapp.runasp.net/api/v1/Admins/get-all-basic-info-users-by-role?role=${role}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Error fetching users: ' + err.message);
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Authentication failed. Please log in again.');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete user by ID with authorization
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const accessToken = user?.accessToken || localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`https://physiocareapp.runasp.net/api/v1/Account/delete-user-by-id?id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Refresh the user list after successful deletion
      fetchUsers(selectedRole);
      alert('User deleted successfully');
    } catch (err) {
      alert('Error deleting user: ' + err.message);
      if (err.message.includes('401') || err.message.includes('403')) {
        alert('Authentication failed. Please log in again.');
      }
    }
  };

  // Handle role change
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    fetchUsers(newRole);
  };

  // Get image URL for user
  const getImageUrl = (fileName) => {
    return fileName ? `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${fileName}&path=Users` : null;
  };

  // Load initial data
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUsers(selectedRole);
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">User Management Dashboard</h3>
            </div>
            <div className="card-body">
              {/* Role Selection */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="roleSelect" className="form-label fw-bold">
                    Select User Role:
                  </label>
                  <select
                    id="roleSelect"
                    className="form-select"
                    value={selectedRole}
                    onChange={handleRoleChange}
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8 d-flex align-items-end">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => fetchUsers(selectedRole)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Loading...
                      </>
                    ) : (
                      'Refresh'
                    )}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Users Table */}
              {!loading && users.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Profile</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            {user.fileName ? (
                              <img
                                src={getImageUrl(user.fileName)}
                                alt={user.fullName}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0iI2Y4ZjlmYSIvPjxwYXRoIGQ9Im0yNSAxNmE0IDQgMCAxIDEgMCA4IDQgNCA0IDAgMCAxIDAtOFptLTggMTJhOCA4IDAgMCAxIDE2IDBaIiBmaWxsPSIjNmM3NTdkIi8+PC9zdmc+';
                                }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                style={{ width: '50px', height: '50px' }}
                              >
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="fw-medium">{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>{user.address || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteUser(user.id)}
                              title="Delete User"
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No Users Found */}
              {!loading && users.length === 0 && !error && (
                <div className="alert alert-info text-center" role="alert">
                  <h5>No users found</h5>
                  <p className="mb-0">There are no users with the role "{selectedRole}" in the system.</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Count Badge */}
      {!loading && users.length > 0 && (
        <div className="fixed-bottom mb-3 me-3 d-flex justify-content-end">
          <span className="badge bg-primary fs-6">
            Total {selectedRole}s: {users.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserManagement;