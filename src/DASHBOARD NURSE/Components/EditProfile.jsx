// src/components/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Image } from 'react-bootstrap';
import api from './api';
import defaultAvatar from '../../assets/images/00001zon_cropped.png';
import DashboardLayout from './DashboardLayout';

export default function EditProfilePage() {
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
        const response = await api.get('/nurse/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback sample data
        setProfile({
          fname: 'أميرة',
          lname: 'الزيد',
          email: 'amira@example.com',
          password: '',
          gender: 'أنثى',
          age: 30,
          phone: '01000000000',
          evaluation: 5,
          image: defaultAvatar,
          homeAddress: {
            governorate: 'القاهرة',
            city: 'القاهرة',
            area: 'المعادي',
            street: 'شارع التحرير',
          },
        });
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
      alert('تم تحديث الملف الشخصي بنجاح!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء تحديث الملف الشخصي.');
    }
  };

  return (
    <DashboardLayout title="الملف الشخصي">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">تعديل الملف الشخصي</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="fname" className="mb-3">
              <Form.Label>الاسم الأول</Form.Label>
              <Form.Control type="text" name="fname" value={profile.fname} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="lname" className="mb-3">
              <Form.Label>اسم العائلة</Form.Label>
              <Form.Control type="text" name="lname" value={profile.lname} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control type="email" name="email" value={profile.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control type="password" name="password" value={profile.password} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="gender" className="mb-3">
              <Form.Label>الجنس</Form.Label>
              <Form.Control type="text" name="gender" value={profile.gender} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="age" className="mb-3">
              <Form.Label>العمر</Form.Label>
              <Form.Control type="number" name="age" value={profile.age} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="phone" className="mb-3">
              <Form.Label>الهاتف</Form.Label>
              <Form.Control type="text" name="phone" value={profile.phone} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="evaluation" className="mb-3">
              <Form.Label>التقييم</Form.Label>
              <Form.Control type="number" name="evaluation" value={profile.evaluation} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="image" className="mb-3">
              <Form.Label>رابط الصورة</Form.Label>
              <Form.Control type="text" name="image" value={profile.image} onChange={handleChange} />
              {profile.image && <Image src={profile.image} roundedCircle width="100" className="mt-2" />}
            </Form.Group>
            <h4 className="mt-4">العنوان</h4>
            <Form.Group controlId="homeAddress.governorate" className="mb-3">
              <Form.Label>المحافظة</Form.Label>
              <Form.Control type="text" name="homeAddress.governorate" value={profile.homeAddress.governorate} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="homeAddress.city" className="mb-3">
              <Form.Label>المدينة</Form.Label>
              <Form.Control type="text" name="homeAddress.city" value={profile.homeAddress.city} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="homeAddress.area" className="mb-3">
              <Form.Label>المنطقة</Form.Label>
              <Form.Control type="text" name="homeAddress.area" value={profile.homeAddress.area} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="homeAddress.street" className="mb-3">
              <Form.Label>الشارع</Form.Label>
              <Form.Control type="text" name="homeAddress.street" value={profile.homeAddress.street} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">حفظ التغييرات</Button>
          </Form>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}
