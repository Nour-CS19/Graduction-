// PhyAnalysisCenterEdit.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PhyAnalysisCenterService from '../Services/PhyAnalysisCenterService';

// idDecoder: assumes your id is Base64 encoded.
const idDecoder = (encodedId) => {
  try {
    return atob(encodedId);
  } catch (error) {
    console.error("Error decoding id:", error);
    return encodedId; // Fallback if decoding fails.
  }
};

const PhyAnalysisCenterEdit = () => {
  // The URL parameter is the encrypted id.
  const { id: encryptedId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    governorate: '',
    city: '',
    area: '',
    street: '',
    phone: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        // Decode the encrypted id before fetching.
        const decodedId = idDecoder(encryptedId);
        const response = await PhyAnalysisCenterService.getById(decodedId);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching center:', error);
      }
    };
    fetchCenter();
  }, [encryptedId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Decode the id again when updating.
      const decodedId = idDecoder(encryptedId);
      await PhyAnalysisCenterService.update(decodedId, formData);
      navigate('/centers');
    } catch (error) {
      console.error('Error updating center:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Edit Pharmacy Analysis Center</h2>
      <Form onSubmit={handleSubmit}>
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
          Save Changes
        </Button>{' '}
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default PhyAnalysisCenterEdit;
