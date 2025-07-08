import React from 'react';
import Header from '../Layout/Header';
import DashboardAnalytics from '../Dashboard/DashboardAnalytics';
import { Container } from 'react-bootstrap';
import Layout from '../Layout/Layout';

const DashboardPage = () => {
  const dischargeList = 5;
  const newPatients = 12;
  const totalPatients = 200;

  return (
    <Layout>
      <Header title="Dashboard" />
      <Container className="p-4">
        <div className="welcome-banner p-4 mb-4 rounded bg-light">
          <h5 className="fw-bold mb-2">Welcome, Nurse Jeniffer Turner!</h5>
          <p>
            Track your tasks, manage appointments and consultations, and monitor patient analytics.
          </p>
        </div>
        <DashboardAnalytics 
          dischargeList={dischargeList}
          newPatients={newPatients}
          totalPatients={totalPatients}
        />
      </Container>
    </Layout>
  );
};

export default DashboardPage;
