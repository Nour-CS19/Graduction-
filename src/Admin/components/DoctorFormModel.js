
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
const DoctorFormModal = ({ show, handleClose, handleSubmit, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phoneNumber: '',
    email: '',
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        specialty: editData.specialty || '',
        phoneNumber: editData.phoneNumber || '',
        email: editData.email || '',
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      handleSubmit(formData);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.specialty || !formData.phoneNumber || !formData.email) {
      setError('All fields are required.');
      return false;
    }
    setError('');
    return true;
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editData ? 'Edit Doctor' : 'Add New Doctor'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter doctor name"
            />
          </Form.Group>

          <Form.Group controlId="formSpecialty">
            <Form.Label>Specialty</Form.Label>
            <Form.Control
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="Enter specialty"
            />
          </Form.Group>

          <Form.Group controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmitForm}>
          {editData ? 'Update Doctor' : 'Add Doctor'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DoctorFormModal;







