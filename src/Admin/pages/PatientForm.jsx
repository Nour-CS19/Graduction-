// CreatePatient.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card } from 'react-bootstrap';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { encodeId } from './idEncoder'; // If you need to encode your UUIDs

export default function CreatePatient() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  // State for the patient
  const [patient, setPatient] = useState({
    fname: '',
    lname: '',
    gender: 'Female', // toggles with checkbox
    age: '',
    email: '',
    phone: '',
    password: '',
    AdminId: encodeId(uuidv4()),
    HomeId: encodeId(uuidv4())
  });

  // State for the selected photo file
  const [photoFile, setPhotoFile] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    try {
      // Convert age to an integer
      const finalAge = parseInt(patient.age, 10) || 0;

      // Build a FormData object
      const formData = new FormData();
      formData.append('fname', patient.fname);
      formData.append('lname', patient.lname);
      formData.append('gender', patient.gender);
      formData.append('age', finalAge);
      formData.append('email', patient.email);
      formData.append('phone', patient.phone);
      formData.append('password', patient.password);
      formData.append('AdminId', patient.AdminId);
      formData.append('HomeId', patient.HomeId);

      if (photoFile) {
        // If your PatientForCerationDTO includes a property for the photo, 
        // match that property name here, e.g. 'photo'
        formData.append('photo', photoFile);
      }

      // POST /api/v1/Patients
      const response = await axios.post('/api/v1/Patients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // The server returns a string: "Patient With {id} Added Successful"
      setMessage(response.data); // e.g. "Patient With 123e4567-e89b-12d3-a456-426614174000 Added Successful"
    } catch (err) {
      console.error('Error creating patient:', err.response?.data || err.message);
      setError(err.response?.data || err.message);
    }
  };

  // If we want to navigate away after success, we can do so:
  const handleGoBack = () => {
    navigate('/patients');
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Create Patient</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* First Name */}
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={patient.fname}
                onChange={(e) => setPatient({ ...patient, fname: e.target.value })}
                required
              />
            </Form.Group>

            {/* Last Name */}
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={patient.lname}
                onChange={(e) => setPatient({ ...patient, lname: e.target.value })}
                required
              />
            </Form.Group>

            {/* Gender as a single checkbox */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Male"
                checked={patient.gender === 'Male'}
                onChange={(e) =>
                  setPatient({ ...patient, gender: e.target.checked ? 'Male' : 'Female' })
                }
              />
              <Form.Text className="text-muted">
                Unchecked = Female, Checked = Male
              </Form.Text>
            </Form.Group>

            {/* Age */}
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                required
              />
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={patient.email}
                onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                required
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={patient.phone}
                onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                required
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={patient.password}
                onChange={(e) => setPatient({ ...patient, password: e.target.value })}
                required
              />
            </Form.Group>

            {/* Photo (optional) */}
            <Form.Group className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
              <Form.Text className="text-muted">
                If selected, will be stored as binary in the database.
              </Form.Text>
            </Form.Group>

            {/* Hidden AdminId & HomeId if your backend requires them */}
            {/* <Form.Control type="text" value={patient.AdminId} readOnly hidden />
            <Form.Control type="text" value={patient.HomeId} readOnly hidden /> */}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleGoBack}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Patient
              </Button>
            </div>
          </Form>
          {message && <p className="text-success mt-3">{message}</p>}
          {error && <p className="text-danger mt-3">{error}</p>}
        </Card.Body>
      </Card>
    </Container>
  );
}
