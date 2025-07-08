// src/components/LogoutPage.js
import React, { useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from './api';
import DashboardLayout from './DashboardLayout';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
    logout();
  }, [navigate]);

  return (
    <DashboardLayout title="تسجيل الخروج">
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" />
        <Alert variant="info" className="mt-3">
          جاري تسجيل الخروج...
        </Alert>
      </Container>
    </DashboardLayout>
  );
}
