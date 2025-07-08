// src/pages/PatientsListPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Layout from '../Layout/Layout';
import Header from '../Layout/Header';
import api from '../Api/APi';

const PatientsListPage = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients'); // Adjust endpoint as needed
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleAccept = async (patientId) => {
    try {
      await api.post('/patients/accept', { id: patientId });
      setPatients(patients.map(p => (p.id === patientId ? { ...p, status: 'Accepted' } : p)));
    } catch (error) {
      console.error('Error accepting patient:', error);
    }
  };

  const handleRemove = async (patientId) => {
    try {
      await api.delete('/patients/delete', { data: { id: patientId } });
      setPatients(patients.filter(p => p.id !== patientId));
    } catch (error) {
      console.error('Error removing patient:', error);
    }
  };

  return (
    <Layout>
      <Header title="Patients List" />
      <Container className="p-4">
        <h2 className="mb-4">Patients Management</h2>
        <Row>
          {patients.map(patient => (
            <Col md={6} key={patient.id} className="mb-3">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>{patient.name}</Card.Title>
                  <Card.Text>
                    <strong>Case:</strong> {patient.case}<br />
                    <strong>Address:</strong> {patient.address}<br />
                    <strong>Price:</strong> {patient.price}<br />
                    <strong>Time:</strong> {patient.time}
                  </Card.Text>
                  <div className="d-flex justify-content-end">
                    <Button variant="success" className="me-2" onClick={() => handleAccept(patient.id)}>
                      Accept
                    </Button>
                    <Button variant="danger" onClick={() => handleRemove(patient.id)}>
                      Remove
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Layout>
  );
};

export default PatientsListPage;
