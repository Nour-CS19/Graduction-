// src/components/PatientFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
const PatientFormModal = ({ show, handleClose, handleSubmit, editData }) => {
  const [formData, setFormData] = useState({ name: "", age: "", medicalHistory: "" });
  const [formErrors, setFormErrors] = useState({ name: "", age: "", medicalHistory: "" });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({ name: editData.name, age: editData.age, medicalHistory: editData.medicalHistory });
    } else {
      setFormData({ name: "", age: "", medicalHistory: "" });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.age || isNaN(formData.age) || formData.age <= 0) errors.age = "Valid age is required";
    if (!formData.medicalHistory) errors.medicalHistory = "Medical history is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = () => {
    if (validateForm()) {
      handleSubmit(formData); // Pass data to parent
      handleClose(); // Close modal
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editData ? "Edit Patient" : "Add Patient"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient's name"
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formAge" className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter patient's age"
              isInvalid={!!formErrors.age}
            />
            <Form.Control.Feedback type="invalid">{formErrors.age}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formMedicalHistory" className="mb-3">
            <Form.Label>Medical History</Form.Label>
            <Form.Control
              as="textarea"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter patient's medical history"
              isInvalid={!!formErrors.medicalHistory}
            />
            <Form.Control.Feedback type="invalid">{formErrors.medicalHistory}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={submitForm}
          disabled={!formData.name || !formData.age || !formData.medicalHistory}
        >
          {editData ? "Save Changes" : "Add Patient"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PatientFormModal;
