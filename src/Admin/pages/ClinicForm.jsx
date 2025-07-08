import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import ClinicService from '../Services/ClinicService';

const ClinicForm = ({ show, clinic, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    governorate: '',
    city: '',
    area: '',
    street: '',
    phone: '',
    date: '',
    price: '',
    doctorId: ''
  });

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await ClinicService.getDoctorClinics();
        setDoctors(data);
        if (data.length > 0 && !clinic?.doctorId) {
          setFormData(prev => ({ ...prev, doctorId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name,
        governorate: clinic.governorate,
        city: clinic.city,
        area: clinic.area,
        street: clinic.street,
        phone: clinic.phone,
        date: clinic.date.split('T')[0],
        price: clinic.price,
        doctorId: clinic.doctorId
      });
    }
  }, [clinic]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseInt(formData.price),
      doctorId: formData.doctorId
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{clinic ? 'Edit Clinic' : 'Create New Clinic'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Governorate</Form.Label>
                <Form.Control
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Area</Form.Label>
                <Form.Control
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <input
            type="hidden"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClinicForm;