// src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = ({ appointments = [] }) => {
  return (
    <div className="dashboard-section">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Total Appointments</h6>
              <h3>{appointments.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Patients Today</h6>
              <h3>15</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>New Messages</h6>
              <h3>8</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6>Earnings</h6>
              <h3>450EGP</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
