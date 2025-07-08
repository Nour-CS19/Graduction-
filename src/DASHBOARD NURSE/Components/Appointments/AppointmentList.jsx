import React from 'react';
import { Table, Button, FormControl } from 'react-bootstrap';

const NurseAppointmentList = ({
  appointments = [],
  appointmentSearch = '',
  setAppointmentSearch = () => {},
  onDeleteAppointment = () => {}
}) => {
  // Filter appointments by typeService (or you can choose another field)
  const filteredAppointments = appointments.filter((apt) =>
    apt.typeService?.toLowerCase().includes(appointmentSearch.toLowerCase())
  );

  return (
    <>
      <FormControl
        type="text"
        placeholder="Search by Type of Service"
        value={appointmentSearch}
        onChange={(e) => setAppointmentSearch(e.target.value)}
        className="mb-3"
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {/* Hidden ID column */}
            <th style={{ display: 'none' }}>ID</th>
            <th>Type of Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
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
                <td style={{ display: 'none' }}>{apt.id}</td>
                <td>{apt.typeService}</td>
                <td>{formattedDate}</td>
                <td>{apt.time || '-'}</td>
                <td>{apt.status || '-'}</td>
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

export default NurseAppointmentList;
