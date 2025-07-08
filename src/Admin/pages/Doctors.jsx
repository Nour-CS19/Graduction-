import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import DoctorService from '../Services/DoctorsService';
import DoctorForm from './DoctorForm';
import DoctorDetails from './DoctorDetails';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await DoctorService.getAllDoctors();
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching doctors');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await DoctorService.deleteDoctor(id);
      fetchDoctors();
    } catch (err) {
      setError('Error deleting doctor');
    }
  };

  const handleSubmit = async (doctorData) => {
    try {
      if (selectedDoctor) {
        await DoctorService.updateDoctor(selectedDoctor.id, doctorData);
      } else {
        await DoctorService.createDoctor(doctorData);
      }
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      setError(selectedDoctor ? 'Error updating doctor' : 'Error creating doctor');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Doctors Management</h2>
      <Button className="mb-3" onClick={() => { setSelectedDoctor(null); setShowForm(true); }}>
        Add New Doctor
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Evaluation</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{`${doctor.fname} ${doctor.lname}`}</td>
                <td>{doctor.phone}</td>
                <td>{doctor.specializationId}</td>
                <td>{doctor.evaluation}</td>
                <td>{doctor.email}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => { setSelectedDoctor(doctor); setShowDetails(true); }}>
                    View
                  </Button>
                  <Button variant="warning" size="sm" className="mx-2" onClick={() => { setSelectedDoctor(doctor); setShowForm(true); }}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(doctor.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <DoctorForm
        show={showForm}
        doctor={selectedDoctor}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />

      <DoctorDetails
        show={showDetails}
        doctor={selectedDoctor}
        onClose={() => setShowDetails(false)}
      />
    </Container>
  );
};

export default Doctors;