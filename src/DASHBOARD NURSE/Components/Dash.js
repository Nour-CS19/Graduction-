
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Modal, Form } from 'react-bootstrap';
import DashboardLayout from './DashboardLayout';
import defaultAvatar from '../../assets/images/00001zon_cropped.png';
import api from './api';
import { createAppointment, getAllAppointments } from './nurseAppointment';
import PatientsListPage from './patientsss'; // Import PatientsListPage

// Inline Appointments List Component
const AppointmentsPage = ({ appointments }) => (
  <Card className="shadow-sm">
    <Card.Body>
      <h4 className="mb-3">المواعيد المحجوزة</h4>
      <ListGroup>
        {appointments.map((appt) => (
          <ListGroup.Item key={appt.id}>
            <div>
              <strong>نوع الخدمة:</strong> {appt.typeService} <br />
              <strong>التاريخ/الوقت:</strong> {appt.date} - {appt.time}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Body>
  </Card>
);

export default function DashNurse() {
  // Local state variables
  const [activeView, setActiveView] = useState('appointments'); // 'appointments' or 'patients'
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Appointment state
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    typeService: '',
    status: '',
    date: '',
    time: '',
    nurseID: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  });
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Patients state
  const [patients, setPatients] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    case: '',
    status: 'تحت الملاحظة'
  });
  
  // Fetch patients and appointments from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback sample data
        setPatients([
          {
            id: 1,
            name: 'محمد علي',
            avatar: defaultAvatar,
            age: 40,
            height: '170سم',
            weight: '80كجم',
            case: 'آلام الظهر',
            status: 'تحت الملاحظة',
            location: 'القاهرة، مصر',
            clinicalRecords: []
          },
          {
            id: 2,
            name: 'سارة يوسف',
            avatar: defaultAvatar,
            age: 28,
            height: '165سم',
            weight: '60كجم',
            case: 'إصابة في الركبة',
            status: 'في العلاج',
            location: 'الإسكندرية، مصر',
            clinicalRecords: []
          },
          {
            id: 3,
            name: 'أحمد شريف',
            avatar: defaultAvatar,
            age: 50,
            height: '175سم',
            weight: '85كجم',
            case: 'إعادة تأهيل بعد الجراحة',
            status: 'مراجعة دورية',
            location: 'الجيزة، مصر',
            clinicalRecords: []
          }
        ]);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await getAllAppointments();
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchPatients();
    fetchAppointments();
  }, []);

  // Appointment handler
  const handleBookAppointment = async () => {
    if (!newAppointment.typeService || !newAppointment.status || !newAppointment.date || !newAppointment.time) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    try {
      const response = await createAppointment(newAppointment);
      setAppointments([...appointments, response.data]);
      setNewAppointment({
        typeService: '',
        status: '',
        date: '',
        time: '',
        nurseID: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      });
      setShowBookModal(false);
      alert('تم حجز الموعد بنجاح!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('حدث خطأ أثناء حجز الموعد.');
    }
  };

  // Patients handlers
  const handleAcceptPatient = async (patientId) => {
    try {
      await api.post('/patients/accept', { id: patientId });
      setPatients(prev =>
        prev.map(p => (p.id === patientId ? { ...p, status: 'تم القبول' } : p))
      );
    } catch (error) {
      console.error('Error accepting patient:', error);
    }
  };

  const handleRejectPatient = async (patientId) => {
    try {
      await api.post('/patients/reject', { id: patientId });
      setPatients(prev =>
        prev.map(p => (p.id === patientId ? { ...p, status: 'مرفوض' } : p))
      );
    } catch (error) {
      console.error('Error rejecting patient:', error);
    }
  };

  const handleRemovePatient = async (patientId) => {
    if (!window.confirm('هل أنت متأكد أنك تريد إزالة هذا المريض؟')) return;
    try {
      await api.delete('/patients/delete', { data: { id: patientId } });
      setPatients(prev => prev.filter(p => p.id !== patientId));
    } catch (error) {
      console.error('Error removing patient:', error);
    }
  };

  const handleAddNewPatient = async () => {
    if (!newPatient.name.trim() || !newPatient.age.trim() || !newPatient.case.trim()) {
      alert('يرجى ملء اسم المريض والعمر والحالة.');
      return;
    }
    const newPatientObj = {
      id: Date.now(),
      avatar: defaultAvatar,
      height: 'غير محدد',
      weight: 'غير محدد',
      location: 'غير محدد',
      clinicalRecords: [],
      ...newPatient
    };
    try {
      const response = await api.post('/patients/create', newPatientObj);
      setPatients([...patients, response.data]);
    } catch (error) {
      console.error('Error adding patient:', error);
      setPatients([...patients, newPatientObj]);
    }
    setNewPatient({ name: '', age: '', case: '', status: 'تحت الملاحظة' });
    setShowAddPatientModal(false);
    alert('تم إضافة المريض بنجاح!');
  };

  // Reminder handler
  const handleAddReminder = async () => {
    if (!newReminder.trim()) return;
    const reminderData = {
      id: Date.now(),
      text: newReminder.trim(),
      date: new Date().toISOString()
    };
    try {
      await api.post('/reminders/create', reminderData);
      setReminders(prev => [...prev, reminderData]);
    } catch (error) {
      console.error('Error adding reminder:', error);
      setReminders(prev => [...prev, reminderData]);
    }
    setNewReminder('');
    setShowReminderModal(false);
  };

  // Image Upload handler
  const handleImageUpload = async (patientId) => {
    if (!selectedFile) return;
    const newAvatar = URL.createObjectURL(selectedFile);
    try {
      await api.post('/patients/upload-avatar', { id: patientId, image: newAvatar });
      setPatients(prev =>
        prev.map(p => (p.id === patientId ? { ...p, avatar: newAvatar } : p))
      );
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setSelectedFile(null);
    setShowImageUpload(false);
  };

  return (
    <DashboardLayout title={activeView === 'appointments' ? "المواعيد" : "قائمة المرضى"}>
      {activeView === 'appointments' && (
        <>
          {/* Statistics */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-info">{patients.length}</h3>
                  <p className="mb-0">عدد المرضى</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-success">{appointments.length}</h3>
                  <p className="mb-0">المواعيد</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              {/* Create Appointment Button */}
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>إضافة موعد</h4>
                    <Button variant="primary" size="sm" onClick={() => setShowBookModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i>إضافة موعد
                    </Button>
                  </div>
                  <p className="text-muted">
                    أو <a href="/dash?modal=book">افتح المودال عبر رابط URL</a>.
                  </p>
                </Card.Body>
              </Card>

              {/* Appointments List */}
              <AppointmentsPage appointments={appointments} />
            </Col>
            <Col md={4}>
              {/* Reminders */}
              <Card className="shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>التذكيرات</h4>
                    <Button variant="primary" size="sm" onClick={() => setShowReminderModal(true)}>
                      + إضافة
                    </Button>
                  </div>
                  <ListGroup variant="flush">
                    {reminders.map((reminder) => (
                      <ListGroup.Item key={reminder.id} className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>{reminder.text}</div>
                          <div>
                            <small className="text-muted me-2">
                              {new Date(reminder.date).toLocaleDateString()}
                            </small>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setReminders(reminders.filter((r) => r.id !== reminder.id))}
                            >
                              <i className="bi bi-trash text-danger"></i>
                            </Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeView === 'patients' && (
        <PatientsListPage
          patients={patients}
          onAccept={handleAcceptPatient}
          onReject={handleRejectPatient}
          onRemove={handleRemovePatient}
          onAddPatient={() => setShowAddPatientModal(true)}
        />
      )}

      {/* ---------------------- MODALS ---------------------- */}

      {/* Create Appointment Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة موعد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleBookAppointment(); }}>
            <Form.Group controlId="typeService" className="mb-3">
              <Form.Label>نوع الخدمة</Form.Label>
              <Form.Control
                type="text"
                name="typeService"
                placeholder="أدخل نوع الخدمة"
                value={newAppointment.typeService}
                onChange={(e) => setNewAppointment({ ...newAppointment, typeService: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>الحالة</Form.Label>
              <Form.Control
                type="text"
                name="status"
                placeholder="أدخل الحالة"
                value={newAppointment.status}
                onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="date" className="mb-3">
              <Form.Label>التاريخ</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="time" className="mb-3">
              <Form.Label>الوقت</Form.Label>
              <Form.Control
                type="text"
                name="time"
                placeholder="مثال: 10:00 AM"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              إضافة موعد
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Patient Modal */}
      <Modal show={showAddPatientModal} onHide={() => setShowAddPatientModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة مريض جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>اسم المريض</Form.Label>
              <Form.Control
                type="text"
                placeholder="أدخل اسم المريض"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>العمر</Form.Label>
              <Form.Control
                type="text"
                placeholder="مثال: 30"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الحالة</Form.Label>
              <Form.Control
                type="text"
                placeholder="مثال: آلام الظهر"
                value={newPatient.case}
                onChange={(e) => setNewPatient({ ...newPatient, case: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddPatientModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleAddNewPatient}>
            إضافة
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}
