import React from 'react';
import { nurseService } from '../Services/NurseService';

const NurseTable = ({ nurses, onView, onEdit, onDelete }) => {
  const handleDelete = async (encryptedId) => {
    if (window.confirm('Are you sure you want to delete this nurse?')) {
      try {
        await nurseService.deleteNurse(encryptedId);
        onDelete();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete nurse');
      }
    }
  };

  return (
    <table className="nurse-table">
      <thead>
        <tr>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Evaluation</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {nurses.map((nurse) => (
          <tr key={nurse.encryptedId}>
            <td>{`${nurse.fname} ${nurse.lname}`}</td>
            <td>{nurse.email}</td>
            <td>{nurse.phone}</td>
            <td>{nurse.evaluation}</td>
            <td>
              <button onClick={() => onView(nurse)}>View</button>
              <button onClick={() => onEdit(nurse)}>Edit</button>
              <button onClick={() => handleDelete(nurse.encryptedId)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NurseTable;