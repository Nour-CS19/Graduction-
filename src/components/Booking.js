import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const doctorsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    city: "Cairo",
    price: 200,
    gender: "Female",
    validation: "Paid",
    rating: 4.5,
    location: "Clinic A, Cairo",
    image: "https://via.placeholder.com/150?text=Dr.+Sarah",
  },
  {
    id: 2,
    name: "Dr. Ahmed Ali",
    specialization: "Dermatologist",
    city: "Alexandria",
    price: 0,
    gender: "Male",
    validation: "Free",
    rating: 4.2,
    location: "Clinic B, Alexandria",
    image: "https://via.placeholder.com/150?text=Dr.+Ahmed",
  },
  {
    id: 3,
    name: "Dr. Laila Kareem",
    specialization: "Pediatrician",
    city: "Cairo",
    price: 300,
    gender: "Female",
    validation: "Paid",
    rating: 4.8,
    location: "Clinic C, Cairo",
    image: "https://via.placeholder.com/150?text=Dr.+Laila",
  },
];

const BookDoctor = () => {
  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
    gender: "",
    validation: "",
  });

  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    let result = doctorsData;

    if (filters.specialization) {
      result = result.filter((doc) =>
        doc.specialization
          .toLowerCase()
          .includes(filters.specialization.toLowerCase())
      );
    }

    if (filters.city) {
      result = result.filter((doc) =>
        doc.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.gender) {
      result = result.filter((doc) => doc.gender === filters.gender);
    }

    if (filters.validation) {
      result = result.filter((doc) => doc.validation === filters.validation);
    }

    setFilteredDoctors(result);
  }, [filters]);

  return (
    <Container className="book-doctor">
      <h1 className="text-center my-5">Book a Doctor</h1>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Control
            type="text"
            name="specialization"
            placeholder="Specialization"
            value={filters.specialization}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            name="validation"
            value={filters.validation}
            onChange={handleFilterChange}
          >
            <option value="">Validation</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Doctor Cards */}
      <Row>
        {filteredDoctors.map((doctor) => (
          <Col md={4} key={doctor.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={doctor.image} />
              <Card.Body>
                <Card.Title>{doctor.name}</Card.Title>
                <Card.Text>
                  Specialization: {doctor.specialization} <br />
                  Location: {doctor.location} <br />
                  Price: {doctor.price === 0 ? "Free" : `$${doctor.price}`} <br />
                  Rating: {doctor.rating} ★
                </Card.Text>
                <Button variant="primary">Book Now</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BookDoctor;
