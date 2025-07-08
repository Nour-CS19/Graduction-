// src/components/AppointmentPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Modal, Form } from 'react-bootstrap';
import DashboardLayout from './DashboardLayout';
import { createAppointment, getAllAppointments } from './nurseAppointment';

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    typeService: '',
    status: '',
    date: '',
    time: '',
    nurseID: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  });
  const [showBookModal, setShowBookModal] = useState(false);

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getAllAppointments();
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const handleBookAppointment = async () => {
    if (!newAppointment.typeService || !newAppointment.status || !newAppointment.date || !newAppointment.time) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    try {
      const response = await createAppointment(newAppointment);
      setAppointments([...appointments, response.data]);
      setNewAppointment({
        typeService: '',
        status: '',
        date: '',
        time: '',
        nurseID: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      });
      setShowBookModal(false);
      alert('تم حجز الموعد بنجاح!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('حدث خطأ أثناء حجز الموعد.');
    }
  };

  return (
    <DashboardLayout title="المواعيد">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col xs={12} className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">المواعيد</h2>
            <Button variant="outline-primary" onClick={() => setShowBookModal(true)}>
              إضافة موعد
            </Button>
          </Col>
        </Row>
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">المواعيد المحجوزة</h4>
            <ListGroup>
              {appointments.map((appt) => (
                <ListGroup.Item key={appt.id}>
                  <div>
                    <strong>نوع الخدمة:</strong> {appt.typeService} <br />
                    <strong>التاريخ/الوقت:</strong> {appt.date} - {appt.time}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة موعد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleBookAppointment(); }}>
            <Form.Group controlId="typeService" className="mb-3">
              <Form.Label>نوع الخدمة</Form.Label>
              <Form.Control
                type="text"
                name="typeService"
                placeholder="أدخل نوع الخدمة"
                value={newAppointment.typeService}
                onChange={(e) => setNewAppointment({ ...newAppointment, typeService: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>الحالة</Form.Label>
              <Form.Control
                type="text"
                name="status"
                placeholder="أدخل الحالة"
                value={newAppointment.status}
                onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="date" className="mb-3">
              <Form.Label>التاريخ</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="time" className="mb-3">
              <Form.Label>الوقت</Form.Label>
              <Form.Control
                type="text"
                name="time"
                placeholder="مثال: 10:00 AM"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              إضافة موعد
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
}
