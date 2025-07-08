// PhyAnalysisCenterTable.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PhyAnalysisCenterService from '../Services/PhyAnalysisCenterService';

const PhyAnalysisCenterTable = () => {
  const [centers, setCenters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await PhyAnalysisCenterService.getAll();
      console.log('Fetched centers:', response.data);
      setCenters(response.data);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this center?')) {
      try {
        await PhyAnalysisCenterService.delete(id);
        fetchCenters();
      } catch (error) {
        console.error('Error deleting center:', error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-center/${id}`);
  };

  const handleView = (id) => {
    navigate(`/view-center/${id}`);
  };

  const handleCreate = () => {
    navigate('/create-center');
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Pharmacy Analysis Centers</h2>
      <Button variant="primary" onClick={handleCreate} className="mb-3">
        Create New Center
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Governorate</th>
            <th>City</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {centers.length > 0 ? (
            centers.map((center) => (
              <tr key={center.id}>
                <td>{center.name}</td>
                <td>{center.governorate}</td>
                <td>{center.city}</td>
                <td>{center.phone}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleView(center.id)}>
                    View
                  </Button>{' '}
                  <Button variant="warning" size="sm" onClick={() => handleEdit(center.id)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(center.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No centers found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default PhyAnalysisCenterTable;
