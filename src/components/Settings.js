import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Collapse } from "react-bootstrap";
import "../css/Settings.css";

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    shareData: false,
  });

  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({ ...notificationSettings, [name]: checked });
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({ ...privacySettings, [name]: checked });
  };

  const handleSaveSettings = () => {
    alert("Settings have been saved!");
  };

  return (
    <Container className="settings">
      <h1 className="text-center my-5">Settings</h1>

      {/* Notification Settings Section */}
      <div className="settings-section">
        <Button
          variant="info"
          className="w-100 text-left mb-2"
          onClick={() => toggleSection("notifications")}
        >
          Notification Settings
        </Button>
        <Collapse in={activeSection === "notifications"}>
          <div className="settings-content">
            <Form>
              <Form.Check
                type="switch"
                id="emailNotifications"
                label="Email Notifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
              />
              <Form.Check
                type="switch"
                id="smsNotifications"
                label="SMS Notifications"
                name="smsNotifications"
                checked={notificationSettings.smsNotifications}
                onChange={handleNotificationChange}
              />
              <Form.Check
                type="switch"
                id="appNotifications"
                label="App Notifications"
                name="appNotifications"
                checked={notificationSettings.appNotifications}
                onChange={handleNotificationChange}
              />
            </Form>
          </div>
        </Collapse>
      </div>

      {/* Privacy Settings Section */}
      <div className="settings-section">
        <Button
          variant="info"
          className="w-100 text-left mb-2"
          onClick={() => toggleSection("privacy")}
        >
          Privacy Settings
        </Button>
        <Collapse in={activeSection === "privacy"}>
          <div className="settings-content">
            <Form>
              <Form.Check
                type="switch"
                id="showProfile"
                label="Show My Profile to Others"
                name="showProfile"
                checked={privacySettings.showProfile}
                onChange={handlePrivacyChange}
              />
              <Form.Check
                type="switch"
                id="shareData"
                label="Share My Data with Partners"
                name="shareData"
                checked={privacySettings.shareData}
                onChange={handlePrivacyChange}
              />
            </Form>
          </div>
        </Collapse>
      </div>

      {/* Save Button */}
      <Row className="justify-content-center">
        <Col md={6}>
          <Button
            variant="primary"
            className="w-100 mt-4"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
