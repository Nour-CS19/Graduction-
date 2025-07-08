import React from 'react';
import Header from '../Layout/Header';
import { Container } from 'react-bootstrap';
import Layout from '../Layout/Layout';

const ConsultationsPage = () => {
  return (
    <Layout>
      <Header title="Consultations" />
      <Container className="p-4">
        <h5>Consultations</h5>
        <p>This is the consultations page. Here you can manage consultation details.</p>
      </Container>
    </Layout>
  );
};

export default ConsultationsPage;
