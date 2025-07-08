import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import ClinicService from '../Services/ClinicService';
import ClinicForm from './ClinicForm';
import ClinicDetails from './ClinicDetails';

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const data = await ClinicService.getAllClinics();
      setClinics(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching clinics');
      setLoading(false);
    }
  };

  const handleDelete = async (encryptedId) => {
    try {
      await ClinicService.deleteClinic(encryptedId);
      fetchClinics();
    } catch (err) {
      setError('Error deleting clinic');
    }
  };

  const handleSubmit = async (clinicData) => {
    try {
      if (selectedClinic) {
        await ClinicService.updateClinic(selectedClinic.encryptedId, clinicData);
      } else {
        await ClinicService.createClinic(clinicData);
      }
      setShowForm(false);
      fetchClinics();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Clinics Management</h2>
      <Button className="mb-3" onClick={() => { setSelectedClinic(null); setShowForm(true); }}>
        Add New Clinic
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Street</th>
              <th>Area</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map(clinic => (
              <tr key={clinic.encryptedId}>
                <td>{clinic.name}</td>
                <td>{clinic.street}</td>
                <td>{clinic.area}</td>
                <td>{clinic.phone}</td>
                <td>
                  <Button variant="info" size="sm" 
                    onClick={() => { setSelectedClinic(clinic); setShowDetails(true); }}>
                    View
                  </Button>
                  <Button variant="warning" size="sm" className="mx-2"
                    onClick={() => { setSelectedClinic(clinic); setShowForm(true); }}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" 
                    onClick={() => handleDelete(clinic.encryptedId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ClinicForm
        show={showForm}
        clinic={selectedClinic}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />

      <ClinicDetails
        show={showDetails}
        clinic={selectedClinic}
        onClose={() => setShowDetails(false)}
      />
    </Container>
  );
};

export default Clinics;