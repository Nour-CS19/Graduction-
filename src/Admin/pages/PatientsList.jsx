// PatientsList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { getAllPatients, deletePatient } from '../Services/PatientsService';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getAllPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Patient List</h2>
        <Link to="/patients/create" className="btn btn-primary">
          Add New Patient
        </Link>
      </div>

      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.fullName || `${patient.fname} ${patient.lname}`}</td>
              <td>{patient.phone}</td>
              <td>{patient.email}</td>
              <td>{patient.age}</td>
              <td>
                <div className="d-flex gap-2">
                  <Link to={`/patients/${patient.id}`} className="btn btn-info btn-sm">
                    View
                  </Link>
                  <Link to={`/patients/${patient.id}/edit`} className="btn btn-warning btn-sm">
                    Edit
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedPatient(patient.id);
                      setShowDeleteModal(true);
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this patient?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(selectedPatient)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
