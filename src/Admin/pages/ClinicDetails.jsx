import React from 'react';
import { Modal, ListGroup } from 'react-bootstrap';

const ClinicDetails = ({ show, clinic, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Clinic Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {clinic && (
          <ListGroup variant="flush">
            <ListGroup.Item><strong>Name:</strong> {clinic.name}</ListGroup.Item>
            <ListGroup.Item><strong>Governorate:</strong> {clinic.governorate}</ListGroup.Item>
            <ListGroup.Item><strong>City:</strong> {clinic.city}</ListGroup.Item>
            <ListGroup.Item><strong>Area:</strong> {clinic.area}</ListGroup.Item>
            <ListGroup.Item><strong>Street:</strong> {clinic.street}</ListGroup.Item>
            <ListGroup.Item><strong>Phone:</strong> {clinic.phone}</ListGroup.Item>
            <ListGroup.Item><strong>Date:</strong> {new Date(clinic.date).toLocaleDateString()}</ListGroup.Item>
            <ListGroup.Item><strong>Price:</strong> ${clinic.price}</ListGroup.Item>
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClinicDetails;