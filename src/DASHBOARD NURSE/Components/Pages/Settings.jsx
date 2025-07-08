// src/pages/SettingsPage.js
import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import Layout from '../Layout/Layout';
import Header from '../Layout/Header';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings via API if needed
    alert('Settings saved successfully.');
  };

  return (
    <Layout>
      <Header title="Settings" />
      <Container className="p-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="mb-4">Application Settings</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="theme" className="mb-3">
                <Form.Label>Theme</Form.Label>
                <Form.Control as="select" name="theme" value={settings.theme} onChange={handleChange}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="notifications" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Enable Notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="language" className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Control as="select" name="language" value={settings.language} onChange={handleChange}>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit">Save Settings</Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default SettingsPage;
