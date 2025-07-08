// CreateAppointmentForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../Api/APi';

const CreateAppointmentForm = ({ onAppointmentCreated }) => {
  const laboratoryID = 'ec4bb6aa-ccee-4344-bde6-08dd6ba808d0';

  const [formData, setFormData] = useState({
    typeService: '',
    status: '',
    phAnalysisName: '',
    date: '',
    time: '',
    laboratoryID: laboratoryID
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
      // POST /CreateAppointment with formData
      const responseData = await api.post('/CreateAppointment', formData);
      // The backend should return the newly created appointment, including "id"
      onAppointmentCreated(responseData);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="typeService">
        <Form.Label>Service Type</Form.Label>
        <Form.Control
          type="text"
          name="typeService"
          value={formData.typeService}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="status">
        <Form.Label>Status</Form.Label>
        <Form.Control
          type="text"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="phAnalysisName">
        <Form.Label>Analysis Name</Form.Label>
        <Form.Control
          type="text"
          name="phAnalysisName"
          value={formData.phAnalysisName}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="date">
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="time">
        <Form.Label>Time</Form.Label>
        <Form.Control
          type="text"
          name="time"
          placeholder="e.g., 10:00 AM"
          value={formData.time}
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
