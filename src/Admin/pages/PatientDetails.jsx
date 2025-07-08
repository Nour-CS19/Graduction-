// PatientDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { getPatient } from '../Services/PatientsService';

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await getPatient(id);
        setPatient(response.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };
    fetchPatient();
  }, [id]);

  if (!patient) return <Container className="mt-4">Loading...</Container>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{patient.fullName || `${patient.fname} ${patient.lname}`}</h2>
          <Link 
            to={`/patients/${id}/upload-photo`} 
            className="btn btn-primary"
          >
            Upload Photo
          </Link>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="fw-bold">Email:</label>
              <p>{patient.email}</p>
            </div>
            <div className="col-md-6">
              <label className="fw-bold">Phone:</label>
              <p>{patient.phone}</p>
            </div>
            <div className="col-md-6">
              <label className="fw-bold">Gender:</label>
              <p>{patient.gender}</p>
            </div>
            <div className="col-md-6">
              <label className="fw-bold">Age:</label>
              <p>{patient.age}</p>
            </div>
            <div className="col-md-6">
              <label className="fw-bold">Admin ID:</label>
              <p>{patient.AdminId}</p>
            </div>
            <div className="col-md-6">
              <label className="fw-bold">Home ID:</label>
              <p>{patient.HomeId}</p>
            </div>
          </div>
          <div className="mt-3">
            <Link to={`/patients/${id}/edit`} className="btn btn-warning me-2">
              Edit Patient
            </Link>
            <Link to="/patients" className="btn btn-secondary">
              Back to List
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
