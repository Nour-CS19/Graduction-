// PhyAnalysisCenterDetails.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import PhyAnalysisCenterService from '../Services/PhyAnalysisCenterService';

// idDecoder: decodes the encrypted id (Base64 example)
const idDecoder = (encodedId) => {
  try {
    return atob(encodedId);
  } catch (error) {
    console.error("Error decoding id:", error);
    return encodedId;
  }
};

const PhyAnalysisCenterDetails = () => {
  // Get the encrypted id from the URL.
  const { id: encryptedId } = useParams();
  const [center, setCenter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const decodedId = idDecoder(encryptedId);
        const response = await PhyAnalysisCenterService.getById(decodedId);
        setCenter(response.data);
      } catch (error) {
        console.error('Error fetching center:', error);
      }
    };
    fetchCenter();
  }, [encryptedId]);

  return (
    <Container className="mt-4">
      {center ? (
        <Card>
          <Card.Header>
            <h3>{center.name}</h3>
          </Card.Header>
          <Card.Body>
            <p><strong>Governorate:</strong> {center.governorate}</p>
            <p><strong>City:</strong> {center.city}</p>
            <p><strong>Area:</strong> {center.area}</p>
            <p><strong>Street:</strong> {center.street}</p>
            <p><strong>Phone:</strong> {center.phone}</p>
          </Card.Body>
          <Card.Footer>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Card.Footer>
        </Card>
      ) : (
        <p>Loading center details...</p>
      )}
    </Container>
  );
};

export default PhyAnalysisCenterDetails;
