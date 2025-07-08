// src/components/NurseFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
const NurseFormModal = ({ show, handleClose, handleSubmit, editData }) => {
  const [formData, setFormData] = useState({ name: "", role: "", specialty: "" });
  const [formErrors, setFormErrors] = useState({ name: "", role: "", specialty: "" });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({ name: editData.name, role: editData.role, specialty: editData.specialty });
    } else {
      setFormData({ name: "", role: "", specialty: "" });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.role) errors.role = "Role is required";
    if (!formData.specialty) errors.specialty = "Specialty is required";
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
        <Modal.Title>{editData ? "Edit Nurse" : "Add Nurse"}</Modal.Title>
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
              placeholder="Enter nurse's name"
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formRole" className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Enter role"
              isInvalid={!!formErrors.role}
            />
            <Form.Control.Feedback type="invalid">{formErrors.role}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formSpecialty" className="mb-3">
            <Form.Label>Specialty</Form.Label>
            <Form.Control
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="Enter specialty"
              isInvalid={!!formErrors.specialty}
            />
            <Form.Control.Feedback type="invalid">{formErrors.specialty}</Form.Control.Feedback>
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
          disabled={!formData.name || !formData.role || !formData.specialty} // Disable if fields are empty
        >
          {editData ? "Save Changes" : "Add Nurse"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NurseFormModal;
