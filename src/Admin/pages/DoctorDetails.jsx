import React from 'react';
import { Modal, ListGroup } from 'react-bootstrap';

const DoctorDetails = ({ show, doctor, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Doctor Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {doctor && (
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>Full Name:</strong> {`${doctor.fname} ${doctor.lname}`}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Email:</strong> {doctor.email}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Phone:</strong> {doctor.phone}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Gender:</strong> {doctor.gender}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Age:</strong> {doctor.age}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Evaluation:</strong> {doctor.evaluation}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Specialization ID:</strong> {doctor.specializationId}
            </ListGroup.Item>
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DoctorDetails;