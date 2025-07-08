// src/components/PatientsListPage.js
import React from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Image } from 'react-bootstrap';
import DashboardLayout from './DashboardLayout';
import defaultAvatar from '../../assets/images/00001zon_cropped.png';

const PatientsListPage = ({ patients = [], onAccept, onReject, onRemove, onAddPatient }) => {
  return (
    <DashboardLayout title="قائمة المرضى">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col xs={12} className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">قائمة المرضى</h2>
            <Button variant="outline-primary" onClick={onAddPatient}>
              إضافة مريض
            </Button>
          </Col>
        </Row>
        <Card className="shadow-sm">
          <Card.Body>
            <ListGroup variant="flush">
              {patients.map((patient) => (
                <ListGroup.Item key={patient.id} className="py-3">
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <Image
                        src={patient.avatar || defaultAvatar}
                        alt="avatar"
                        fluid
                        roundedCircle
                      />
                    </Col>
                    <Col xs={6} md={8}>
                      <h6 className="mb-1">{patient.name}</h6>
                      <small className="text-muted">{patient.case}</small>
                      <br />
                      <Badge bg="secondary">{patient.status}</Badge>
                    </Col>
                    <Col xs={3} md={2} className="text-end">
                      <Button variant="success" size="sm" onClick={() => onAccept(patient.id)} className="me-1">
                        قبول
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => onReject(patient.id)} className="me-1">
                        رفض
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => onRemove(patient.id)}>
                        إزالة
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default PatientsListPage;
