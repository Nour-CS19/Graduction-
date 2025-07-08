import React from 'react';
import Sidebar from './SideBar';
import { Container, Row, Col } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <Container fluid style={{ minHeight: '100vh' }}>
      <Row className="g-0">
        <Col md={3} lg={2}>
          <Sidebar />
        </Col>
        <Col md={9} lg={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
