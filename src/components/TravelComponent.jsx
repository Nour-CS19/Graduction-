import React, { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Collapse,
  Card,
  Image,
} from "react-bootstrap";
import { 
  BsChevronDown, 
  BsChevronUp, 
  BsHospital, 
  BsSun, 
  BsMoon,
  BsStarFill 
} from "react-icons/bs";

const appointmentTimeData = [
  { icon: <BsSun />, text: "Morning (8am-12pm)" },
  { icon: <BsSun />, text: "Afternoon (12pm-4pm)" },
  { icon: <BsMoon />, text: "Evening (4pm-8pm)" },
  { icon: <BsMoon />, text: "Night (8pm-12am)" },
];

const specialtiesData = ["General", "Cardiology", "Orthopedics", "Pediatrics", "Ophthalmology", "Dermatology"];
const hospitalsData = [
  "Cairo University Hospitals",
  "Ain Shams University Hospital",
  "El-Kasr El-Aini Hospital",
  "As-Salam International Hospital",
  "Dar Al Fouad Hospital",
  "Cleopatra Hospital"
];

const doctorData = [
  {
    doctorImg: "/api/placeholder/80/80",
    doctorName: "Dr. Ahmed Hassan",
    specialty: "Cardiology",
    hospital: "Cairo University Hospitals",
    appointmentDate: "JUN 04, SAT",
    appointmentTime: "10:30 AM",
    experience: "15 years",
    rating: "4.8",
    reviews: "243",
    consultationFee: "400 EGP",
    location: "Giza, Cairo"
  },
  {
    doctorImg: "/api/placeholder/80/80",
    doctorName: "Dr. Nour El-Din",
    specialty: "Orthopedics",
    hospital: "Ain Shams University Hospital",
    appointmentDate: "JUN 04, SAT",
    appointmentTime: "2:15 PM",
    experience: "12 years",
    rating: "4.6",
    reviews: "187",
    consultationFee: "350 EGP",
    location: "Nasr City, Cairo"
  },
  {
    doctorImg: "/api/placeholder/80/80",
    doctorName: "Dr. Fatima Abdel-Rahman",
    specialty: "Pediatrics",
    hospital: "El-Kasr El-Aini Hospital",
    appointmentDate: "JUN 05, SUN",
    appointmentTime: "9:00 AM",
    experience: "20 years",
    rating: "4.9",
    reviews: "312",
    consultationFee: "450 EGP",
    location: "Downtown, Cairo"
  },
  {
    doctorImg: "/api/placeholder/80/80",
    doctorName: "Dr. Mohammed El-Sayed",
    specialty: "Ophthalmology",
    hospital: "Dar Al Fouad Hospital",
    appointmentDate: "JUN 06, MON",
    appointmentTime: "4:30 PM",
    experience: "10 years",
    rating: "4.5",
    reviews: "156",
    consultationFee: "375 EGP",
    location: "6th October, Giza"
  },
  {
    doctorImg: "/api/placeholder/80/80",
    doctorName: "Dr. Amira Mahmoud",
    specialty: "Dermatology",
    hospital: "Cleopatra Hospital",
    appointmentDate: "JUN 07, TUE",
    appointmentTime: "11:45 AM",
    experience: "8 years",
    rating: "4.7",
    reviews: "203",
    consultationFee: "425 EGP",
    location: "Heliopolis, Cairo"
  }
];

const DoctorItem = ({ doctor }) => (
  <Row className="mt-4 bg-light p-3 rounded">
    <Col md={2} className="d-flex justify-content-center align-items-center">
      <Image src={doctor.doctorImg} width="80" height="80" roundedCircle className="mb-2" />
    </Col>
    <Col md={6}>
      <h5 className="text-primary mb-1">{doctor.doctorName}</h5>
      <p className="mb-1"><strong>Specialty:</strong> {doctor.specialty}</p>
      <p className="mb-1"><strong>Hospital:</strong> {doctor.hospital}</p>
      <p className="mb-1"><strong>Experience:</strong> {doctor.experience}</p>
      <div className="d-flex align-items-center">
        <BsStarFill className="text-warning me-1" />
        <span className="me-2">{doctor.rating}</span>
        <span className="text-muted">({doctor.reviews} reviews)</span>
      </div>
    </Col>
    <Col md={2} className="text-center d-flex flex-column justify-content-center">
      <p className="mb-1 fw-bold">{doctor.appointmentDate}</p>
      <p className="mb-3">{doctor.appointmentTime}</p>
      <p className="mb-0"><i className="me-1"></i>{doctor.location}</p>
    </Col>
    <Col md={2} className="d-flex flex-column justify-content-center">
      <h5 className="fw-bold text-primary mb-3">{doctor.consultationFee}</h5>
      <Button variant="primary">Book Appointment</Button>
    </Col>
  </Row>
);

const SidebarAccordion = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <Card className="mb-3">
      <Card.Header 
        onClick={() => setOpen(!open)}
        className="d-flex justify-content-between align-items-center cursor-pointer"
        style={{ cursor: "pointer" }}
      >
        <h5 className="mb-0">{title}</h5>
        {open ? <BsChevronUp /> : <BsChevronDown />}
      </Card.Header>
      <Collapse in={open}>
        <Card.Body>{children}</Card.Body>
      </Collapse>
    </Card>
  );
};

const MedicalComponent = () => (
  <Container className="my-5">
    <Card className="mb-4">
      <Card.Body className="bg-primary text-white">
        <Row className="align-items-center">
          <Col md={8} className="d-flex align-items-center">
            <div className="bg-white rounded-circle p-3 me-4">
              <BsHospital size={24} className="text-primary" />
            </div>
            <div>
              <h3>Find Medical Specialists in Cairo</h3>
              <p className="mb-0">JUN 04-10, 2025 | CARDIOLOGY CONSULTATION</p>
            </div>
          </Col>
          <Col md={4} className="text-end">
            <Button variant="light" className="mt-3 mt-md-0">Change Search</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>

    <Row>
      <Col md={3}>
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h3 className="mb-0">FILTERS</h3>
          </Card.Header>
          <Card.Body>
            <SidebarAccordion title="Price Range">
              <Form>
                <Form.Label>Min Price (100 EGP)</Form.Label>
                <Form.Range className="mb-3" />
                <Form.Label>Max Price (1000 EGP)</Form.Label>
                <Form.Range />
              </Form>
            </SidebarAccordion>

            <SidebarAccordion title="Appointment Time">
              {appointmentTimeData.map((item, i) => (
                <Button key={i} variant="outline-secondary" className="w-100 mb-2">
                  {item.icon} {item.text}
                </Button>
              ))}
            </SidebarAccordion>

            <SidebarAccordion title="Specialties">
              {specialtiesData.map((specialty, i) => (
                <Form.Check 
                  key={i}
                  type="checkbox"
                  label={specialty}
                  className="mb-2"
                />
              ))}
            </SidebarAccordion>

            <SidebarAccordion title="Hospitals">
              {hospitalsData.map((hospital, i) => (
                <Form.Check 
                  key={i}
                  type="checkbox"
                  label={hospital}
                  className="mb-2"
                />
              ))}
            </SidebarAccordion>
            
            <Button variant="primary" className="w-100 mt-3">Reset All Filters</Button>
          </Card.Body>
        </Card>
      </Col>

      <Col md={9}>
        <Row className="mb-4">
          <Col>
            <h4>42 Doctors Available</h4>
          </Col>
          <Col className="text-end">
            <Form.Select className="w-auto d-inline-block">
              <option>Sort by Rating</option>
              <option>Sort by Price (Low to High)</option>
              <option>Sort by Price (High to Low)</option>
              <option>Sort by Experience</option>
            </Form.Select>
          </Col>
        </Row>

        {doctorData.map((doctor, i) => (
          <DoctorItem key={i} doctor={doctor} />
        ))}
      </Col>
    </Row>
  </Container>
);

export default MedicalComponent;