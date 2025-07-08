// src/pages/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import Layout from '../Layout/Layout';
import Header from '../Layout/Header';
import api from '../Api/APi';

const EditProfilePage = () => {
  const [profile, setProfile] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    gender: '',
    age: '',
    phone: '',
    evaluation: '',
    image: '',
    homeAddress: {
      governorate: '',
      city: '',
      area: '',
      street: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/nurse/profile'); // Adjust endpoint as needed
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('homeAddress.')) {
      const key = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        homeAddress: { ...prev.homeAddress, [key]: value },
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/nurse/profile/update', profile);
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile.');
    }
  };

  return (
    <Layout>
      <Header title="Edit Profile" />
      <Container className="p-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="mb-4">Edit Nurse Profile</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="fname" className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="fname" value={profile.fname} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="lname" className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="lname" value={profile.lname} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={profile.email} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={profile.password} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="gender" className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Control type="text" name="gender" value={profile.gender} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="age" className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control type="number" name="age" value={profile.age} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="phone" className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" name="phone" value={profile.phone} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="evaluation" className="mb-3">
                <Form.Label>Evaluation</Form.Label>
                <Form.Control type="number" name="evaluation" value={profile.evaluation} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="image" className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control type="text" name="image" value={profile.image} onChange={handleChange} />
              </Form.Group>
              <h5>Home Address</h5>
              <Form.Group controlId="homeAddress.governorate" className="mb-3">
                <Form.Label>Governorate</Form.Label>
                <Form.Control type="text" name="homeAddress.governorate" value={profile.homeAddress.governorate} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="homeAddress.city" className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="homeAddress.city" value={profile.homeAddress.city} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="homeAddress.area" className="mb-3">
                <Form.Label>Area</Form.Label>
                <Form.Control type="text" name="homeAddress.area" value={profile.homeAddress.area} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="homeAddress.street" className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control type="text" name="homeAddress.street" value={profile.homeAddress.street} onChange={handleChange} required />
              </Form.Group>
              <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default EditProfilePage;
