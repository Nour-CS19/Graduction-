// src/components/SettingsPage.js
import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import DashboardLayout from './DashboardLayout';

export default function SettingsPage() {
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
    // Optionally call API to save settings
    alert('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <DashboardLayout title="الإعدادات">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">إعدادات التطبيق</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="theme" className="mb-3">
              <Form.Label>السمة</Form.Label>
              <Form.Control as="select" name="theme" value={settings.theme} onChange={handleChange}>
                <option value="light">فاتح</option>
                <option value="dark">داكن</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="notifications" className="mb-3">
              <Form.Check
                type="checkbox"
                label="تفعيل الإشعارات"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="language" className="mb-3">
              <Form.Label>اللغة</Form.Label>
              <Form.Control as="select" name="language" value={settings.language} onChange={handleChange}>
                <option value="en">الإنجليزية</option>
                <option value="ar">العربية</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">حفظ الإعدادات</Button>
          </Form>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}
