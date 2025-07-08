import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../Api/APi';

const CreateAppointmentForm = ({ onAppointmentCreated }) => {
  // Use your nurse's unique ID here
  const nurseID = 'fb098223-4720-4fc7-bde5-08dd6ba808d0';

  const [formData, setFormData] = useState({
    typeService: '',
    status: '',
    date: '',
    time: '',
    nurseID: nurseID
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST to /CreateAppointment
      const responseData = await api.post('/CreateAppointment', formData);
      onAppointmentCreated(responseData);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Hidden nurseID field */}
      <Form.Control type="hidden" name="nurseID" value={nurseID} />

      <Form.Group controlId="typeService">
        <Form.Label>Type of Service</Form.Label>
        <Form.Control
          type="text"
          name="typeService"
          value={formData.typeService}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="date" className="mt-3">
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="time" className="mt-3">
        <Form.Label>Time</Form.Label>
        <Form.Control
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="status" className="mt-3">
        <Form.Label>Status</Form.Label>
        <Form.Control
          type="text"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3">
        Create Appointment
      </Button>
    </Form>
  );
};

export default CreateAppointmentForm;
