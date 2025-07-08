// src/pages/LogoutPage.js
import React, { useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import Layout from '../Layout/Layout';
import Header from '../Layout/Header';
import { useNavigate } from 'react-router-dom';
import api from '../Api/APi';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post('/auth/logout'); // Adjust endpoint as needed
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    logout();
  }, [navigate]);

  return (
    <Layout>
      <Header title="Logout" />
      <Container className="p-4 text-center">
        <Spinner animation="border" role="status" />
        <Alert variant="info" className="mt-3">
          Logging out, please wait...
        </Alert>
      </Container>
    </Layout>
  );
};

export default LogoutPage;
