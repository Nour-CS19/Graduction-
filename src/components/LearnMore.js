import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

const LearnMore = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const data = [
        {
          id: 1,
          name: "Online Consultation",
          steps: ["Register", "Choose Doctor", "Start Chat"],
        },
        {
          id: 2,
          name: "Book Doctor",
          steps: ["Select Specialization", "Pick Date", "Confirm Booking"],
        },
      ];
      setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <Container>
      <h2 className="text-center my-4">Learn More About Our Services</h2>
      {services.map((service) => (
        <Row key={service.id} className="mb-4">
          <Col>
            <h4>{service.name}</h4>
            <ul>
              {service.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default LearnMore;
