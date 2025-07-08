import React from 'react';

const NurseDetailsModal = ({ nurse, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Nurse Details</h2>
        <div className="details-grid">
          <div><strong>Full Name:</strong> {nurse.fname} {nurse.lname}</div>
          <div><strong>Email:</strong> {nurse.email}</div>
          <div><strong>Phone:</strong> {nurse.phone}</div>
          <div><strong>Gender:</strong> {nurse.gender}</div>
          <div><strong>Age:</strong> {nurse.age}</div>
          <div><strong>Evaluation:</strong> {nurse.evaluation}</div>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NurseDetailsModal;