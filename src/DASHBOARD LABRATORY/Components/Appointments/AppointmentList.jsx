// AppointmentList.jsx
import React from 'react';
import { Table, Button, FormControl } from 'react-bootstrap';

const AppointmentList = ({
  appointments,
  appointmentSearch,
  setAppointmentSearch,
  onDeleteAppointment
}) => {
  // Filter appointments by phAnalysisName, or any other field you prefer
  const filteredAppointments = appointments.filter((apt) =>
    apt.phAnalysisName?.toLowerCase().includes(appointmentSearch.toLowerCase())
  );

  return (
    <>
      <FormControl
        type="text"
        placeholder="Search appointments by Analysis Name"
        value={appointmentSearch}
        onChange={(e) => setAppointmentSearch(e.target.value)}
        className="mb-3"
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {/* We'll hide the ID column from view */}
            <th style={{ display: 'none' }}>ID</th>
            <th>Analysis Name</th>
            <th>Service Type</th>
            <th>Status</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((apt) => {
            const dateObj = new Date(apt.date);
            const formattedDate = !isNaN(dateObj)
              ? dateObj.toLocaleDateString()
              : 'Invalid Date';

            return (
              <tr key={apt.id}>
                {/* Hidden ID */}
                <td style={{ display: 'none' }}>{apt.id}</td>
                <td>{apt.phAnalysisName}</td>
                <td>{apt.typeService}</td>
                <td>{apt.status}</td>
                <td>{formattedDate}</td>
                <td>{apt.time || '-'}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteAppointment(apt.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default AppointmentList;
