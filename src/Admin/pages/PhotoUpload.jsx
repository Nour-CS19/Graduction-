// PhotoUpload.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { uploadPatientPhoto } from '../Services/PatientsService';

export default function PhotoUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await uploadPatientPhoto(id, formData);
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Upload Patient Photo</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select Photo</Form.Label>
              <Form.Control 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Upload
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
