// PhyAnalysisCenterForm.jsx
import React, { useState } from 'react';
import { Button, Form, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// idEncoder function using Base64 encoding.
// Replace this with your actual encryption logic if needed.
const idEncoder = (id) => btoa(id);

const PhyAnalysisCenterForm = () => {
  const [formData, setFormData] = useState({
    id: '', // hidden field for id (for edit, this would be pre-populated)
    name: '',
    governorate: '',
    city: '',
    area: '',
    street: '',
    phone: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a new id if not already provided (for a new record)
      let idToUse = formData.id || uuidv4();
      console.log("Raw ID:", idToUse);

      // "Encrypt" (encode) the id using the idEncoder function
      const encodedId = idEncoder(idToUse);
      console.log("Encoded ID:", encodedId);

      // Prepare FormData since the backend expects [FromForm] data
      const dataToSend = new FormData();
      dataToSend.append('id', encodedId);
      dataToSend.append('name', formData.name);
      dataToSend.append('governorate', formData.governorate);
      dataToSend.append('city', formData.city);
      dataToSend.append('area', formData.area);
      dataToSend.append('street', formData.street);
      dataToSend.append('phone', formData.phone);

      // Debug: Log each key/value pair
      for (let [key, value] of dataToSend.entries()) {
        console.log(key, value);
      }

      // Post to your API endpoint.
      // Your controller route is: /api/v1/PhAnalysisCenters (which accepts [FromForm])
      const response = await axios.post('/api/v1/PhAnalysisCenters', dataToSend);
      console.log('Created center:', response.data);
      navigate('/centers');
    } catch (error) {
      console.error('Error creating center:', error.response?.data || error.message);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Create New Pharmacy Analysis Center</h2>
      <Form onSubmit={handleSubmit}>
        {/* Hidden field for id */}
        <Form.Control
          type="hidden"
          name="id"
          value={formData.id}
          onChange={handleInputChange}
        />

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Governorate</Form.Label>
          <Form.Control
            type="text"
            name="governorate"
            value={formData.governorate}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Area</Form.Label>
          <Form.Control
            type="text"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Center
        </Button>
      </Form>
    </Container>
  );
};

export default PhyAnalysisCenterForm;
