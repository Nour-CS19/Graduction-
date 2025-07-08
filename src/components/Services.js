
/*

import React from "react";
import { Container, Row, Col, Card, Accordion, Button } from "react-bootstrap";
import "../css/Services.css";

const servicesData = [
  {
    id: 1,
    title: "Consultations",
    description:
      "Book an appointment to meet top specialists at our clinics or hospitals.",
    steps: [
      "Select your preferred clinic or hospital.",
      "Choose a time slot and confirm the appointment.",
      "Visit the clinic on the scheduled date.",
    ],
    image: "../assets/images/Group 19663.png",
  },
  {
    id: 3,
    title: "Nursing Services",
    description:
      "Hire professional nurses for home care and post-surgery recovery.",
    steps: [
      "Browse our nursing services.",
      "Select the required care package.",
      "Schedule a nurse visit to your home.",
    ],
    image: "../assets/images/Image1Nursig.png",
  },
  {
    id: 5,
    title: "Medical Analysis",
    description:
      "Access comprehensive diagnostic tests and receive results online.",
    steps: [
      "Select the required analysis.",
      "Schedule a sample collection or visit the lab.",
      "Receive your results online securely.",
    ],
    image: "../assets/images/Image.png",
  },
];

const Services = () => {
  return (
    <Container className="services">
      <h1 className="text-center my-5">Our Services</h1>

      <Row>
        {servicesData.map((service) => (
          <Col md={6} key={service.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={service.image} />
              <Card.Body>
                <Card.Title>{service.title}</Card.Title>
                <Card.Text>{service.description}</Card.Text>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Process Steps</Accordion.Header>
                    <Accordion.Body>
                      <ul>
                        {service.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Services;



*/