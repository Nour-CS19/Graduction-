import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DoctorForm = ({ show, doctor, onSubmit, onClose }) => {
  const [formData, setFormData] = React.useState({
    fname: '',
    lname: '',
    email: '',
    gender: 'Male',
    password: '',
    age: '',
    phone: '',
    evaluation: 0,
    specializationId: ''
  });

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        fname: doctor.fname,
        lname: doctor.lname,
        email: doctor.email,
        gender: doctor.gender,
        password: '',
        age: doctor.age,
        phone: doctor.phone,
        evaluation: doctor.evaluation,
        specializationId: doctor.specializationId
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!doctor}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Evaluation</Form.Label>
            <Form.Control
              type="number"
              name="evaluation"
              value={formData.evaluation}
              onChange={handleChange}
              min="0"
              max="5"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Specialization ID</Form.Label>
            <Form.Control
              type="text"
              name="specializationId"
              value={formData.specializationId}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DoctorForm;