import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import api from '../Api/APi';
import Layout from '../Layout/Layout';
import Header from '../Layout/Header';
import NurseAppointmentList from '../Appointments/AppointmentList';
import CreateAppointmentForm from '../Appointments/AppointmentForm';

const NurseAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.get('/GetAll');
        console.log('Fetched nurse appointments:', data);
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching nurse appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  // Delete appointment by its unique ID
  const handleDeleteAppointment = async (appointmentId) => {
    if (!appointmentId || appointmentId === '00000000-0000-0000-0000-000000000000') {
      alert('Invalid appointment ID. Cannot delete appointment.');
      return;
    }
    try {
      await api.del('/DeleteAppointment', { id: appointmentId });
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== appointmentId)
      );
      alert('Appointment deleted successfully.');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment: ' + error.message);
    }
  };

  // When a new appointment is created, add it to the list
  const handleAppointmentCreated = (newAppointment) => {
    setShowCreateModal(false);
    setAppointments((prev) => [...prev, newAppointment]);
  };

  return (
    <Layout>
      <Header title="Nurse Appointments" />
      <Container className="p-4">
        <Row className="g-3 mb-3 justify-content-end">
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Add Appointment
            </Button>
          </Col>
        </Row>
        <Row className="g-3">
          <Col md={12}>
            <NurseAppointmentList
              appointments={appointments}
              appointmentSearch={appointmentSearch}
              setAppointmentSearch={setAppointmentSearch}
              onDeleteAppointment={handleDeleteAppointment}
            />
          </Col>
        </Row>
      </Container>

      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateAppointmentForm onAppointmentCreated={handleAppointmentCreated} />
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default NurseAppointmentsPage;
