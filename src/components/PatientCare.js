import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

// Custom SVG Icons
const ChevronDown = ({ size = 20, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUp = ({ size = 20, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const MessageCircle = ({ size = 16, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const Phone = ({ size = 16, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const Mail = ({ size = 16, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <path d="M22 6l-10 7-10-7"></path>
  </svg>
);

const ArrowRight = ({ size = 16, color = "#007bff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

const WhatsApp = ({ size = 24, color = "white" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 2C8.3 2 2 8.3 2 16c0 2.9.9 5.5 2.4 7.7L2 30l6.5-2.3c2 1.3 4.5 2.1 7.1 2.1 7.7 0 14-6.3 14-14S23.7 2 16 2z"></path>
    <path d="M10.5 11.5c0 5.5 5.5 10 10 10l2-2c-1.5-1-2.5-2-3-2.5s-1-.5-1.5 0l-1 1c-.5.5-1 .5-1.5.5s-2.5-.5-4-2c-1.5-1.5-2-3.5-2-4s0-1 0-1.5c.5-.5 1-.5 1.5-.5h1z"></path>
  </svg>
);

const PhysioCareFAQ = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredContactCard, setHoveredContactCard] = useState(false);
  const [hoveredHelp, setHoveredHelp] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqList = [
    {
      question: "What is PhysioCare?",
      answer:
        "PhysioCare is a premier healthcare platform designed to provide accessible and personalized medical services across Egypt. It offers online consultations, clinic visits, at-home healthcare, nursing services, and laboratory testing, connecting patients with certified professionals efficiently.",
    },
    {
      question: "Why is PhysioCare important?",
      answer:
        "PhysioCare enhances healthcare accessibility by bringing expert care to your doorstep or through virtual platforms, saving time and ensuring quality. It supports diverse medical needs, improves patient outcomes with tailored plans, and strengthens community health with reliable services.",
    },
    {
      question: "How do I book an appointment with PhysioCare?",
      answer:
        "Booking is simple: visit our website or mobile app, select your preferred service (online consultation, clinic visit, at-home care, nursing, or lab testing), choose a convenient time slot, and confirm. You’ll receive a confirmation via email or SMS for a seamless experience.",
    },
    {
      question: "Why choose Menofia with PhysioCare?",
      answer:
        "Menofia is a strategic hub for PhysioCare, offering top-tier healthcare with expert staff, modern facilities, and tailored services like at-home nursing and lab testing. Its central location ensures convenient access and community-focused care in the region.",
    },
  ];

  const styles = {
    container: {
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 15px",
    },
    headerSection: {
      textAlign: "center",
      marginBottom: "50px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "white",
      border: "1px solid #dee2e6",
      borderRadius: "50px",
      padding: "4px 12px",
      marginBottom: "24px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#6c757d",
    },
    title: {
      fontSize: "3rem",
      fontWeight: "bold",
      color: "#007bff",
      marginBottom: "16px",
      lineHeight: "1.2",
    },
    subtitle: {
      fontSize: "1.25rem",
      color: "#6c757d",
      margin: "0 auto",
      maxWidth: "800px",
      lineHeight: "1.5",
    },
    faqSection: {
      marginBottom: "50px",
    },
    faqContainer: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    faqCard: {
      backgroundColor: "white",
      border: "none",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "16px",
      transition: "all 0.3s ease",
      overflow: "hidden",
    },
    faqCardHovered: {
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
    faqButton: {
      width: "100%",
      padding: "20px",
      border: "none",
      backgroundColor: "transparent",
      textAlign: "left",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#333",
      outline: "none",
    },
    faqAnswer: {
      padding: "0 20px 20px",
      color: "#6c757d",
      lineHeight: "1.6",
      fontSize: "1rem",
      margin: 0,
      textAlign: "left",
    },
    contactSection: {
      marginBottom: "50px",
      display: "flex",
      justifyContent: "center",
    },
    contactCard: {
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 8px 16px rgba(0,123,255,0.3)",
      padding: "32px",
      maxWidth: "400px",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
    contactCardHovered: {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0,123,255,0.4)",
    },
    contactBadge: {
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: "50px",
      padding: "4px 12px",
      marginBottom: "24px",
      fontSize: "14px",
      fontWeight: "500",
    },
    contactTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "16px",
      textAlign: "left",
    },
    contactText: {
      fontSize: "1rem",
      marginBottom: "24px",
      opacity: "0.9",
      textAlign: "left",
    },
    contactButton: {
      background: "linear-gradient(45deg, #ffffff, #e0e0e0)",
      color: "#007bff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 24px",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      margin: "0 auto",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      textDecoration: "none",
      "&:hover": {
        background: "linear-gradient(45deg, #f0f0f0, #d3d3d3)",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
      },
      direction: "ltr",
    },
    contactInfo: {
      display: "flex",
      justifyContent: "center",
      gap: "32px",
      marginTop: "24px",
      flexDirection: "row",
    },
    contactInfoItem: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "14px",
      opacity: "0.75",
      flexDirection: "row",
      color: "white", // Ensure text is visible against dark background
    },
    helpSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "24px",
    },
    helpCard: {
      backgroundColor: "white",
      border: "none",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      padding: "32px",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
    helpCardHovered: {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    },
    helpIcon: {
      backgroundColor: "#007bff",
      borderRadius: "50%",
      width: "48px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px",
      color: "white", // Explicitly set color for stroke
    },
    helpTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
      textAlign: "left",
    },
    helpText: {
      fontSize: "14px",
      color: "#6c757d",
      margin: 0,
      textAlign: "left",
    },
  };

  return (
    <div style={styles.container} dir="ltr">
      <div style={styles.wrapper}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <div style={styles.badge}>
            <span>PhysioCare Support</span>
          </div>
          <h1 style={styles.title}>Frequently Asked Questions</h1>
          <p style={styles.subtitle}>
            Find answers to common questions about PhysioCare services, appointments, and how we can support your healthcare journey.
          </p>
        </div>

        {/* FAQ Section */}
        <div style={styles.faqSection}>
          <div style={styles.faqContainer}>
            {faqList.map((faq, index) => (
              <div
                key={index}
                style={{
                  ...styles.faqCard,
                  ...(hoveredCard === index ? styles.faqCardHovered : {}),
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <button
                  style={styles.faqButton}
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp size={20} color="#007bff" />
                  ) : (
                    <ChevronDown size={20} color="#007bff" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div>
                    <p style={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us Section */}
        <div style={styles.contactSection}>
          <div
            style={{
              ...styles.contactCard,
              ...(hoveredContactCard ? styles.contactCardHovered : {}),
            }}
            onMouseEnter={() => setHoveredContactCard(true)}
            onMouseLeave={() => setHoveredContactCard(false)}
          >
            <div style={styles.contactBadge}>
              <span>Need Help?</span>
            </div>
            <h3 style={styles.contactTitle}>Still Have Questions?</h3>
            <p style={styles.contactText}>
              Our expert team is here to help you with personalized support and guidance.
            </p>
            <a href="/AboutUs" style={styles.contactButton}>
              <MessageCircle size={16} color="white" /> {/* Explicit color for visibility */}
              <span>Contact Our Team</span>
              <ArrowRight size={16} color="white" /> {/* Explicit color for visibility */}
            </a>
            <div style={styles.contactInfo}>
              <div style={styles.contactInfoItem}>
                <Phone size={14} color="white" /> {/* Explicit color for visibility */}
                <span>24/7 Support</span>
              </div>
              <div style={styles.contactInfoItem}>
                <Mail size={14} color="white" /> {/* Explicit color for visibility */}
                <span>Instant Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help Section */}
        <div style={styles.helpSection}>
          <div
            style={{
              ...styles.helpCard,
              ...(hoveredHelp === 0 ? styles.helpCardHovered : {}),
            }}
            onMouseEnter={() => setHoveredHelp(0)}
            onMouseLeave={() => setHoveredHelp(null)}
          >
            <div style={styles.helpIcon}>
              <WhatsApp size={24} />
            </div>
            <h4 style={styles.helpTitle}>WhatsApp</h4>
            <p style={styles.helpText}>Speak directly with our support team</p>
          </div>
          <div
            style={{
              ...styles.helpCard,
              ...(hoveredHelp === 1 ? styles.helpCardHovered : {}),
            }}
            onMouseEnter={() => setHoveredHelp(1)}
            onMouseLeave={() => setHoveredHelp(null)}
          >
            <div style={styles.helpIcon}>
              <MessageCircle size={24} color="white" /> {/* Explicit color for visibility */}
            </div>
            <h4 style={styles.helpTitle}>Live Chat</h4>
            <p style={styles.helpText}>Get instant help through live messaging</p>
          </div>
          <div
            style={{
              ...styles.helpCard,
              ...(hoveredHelp === 2 ? styles.helpCardHovered : {}),
            }}
            onMouseEnter={() => setHoveredHelp(2)}
            onMouseLeave={() => setHoveredHelp(null)}
          >
            <div style={styles.helpIcon}>
              <Mail size={24} color="white" /> {/* Explicit color for visibility */}
            </div>
            <h4 style={styles.helpTitle}>Email Support</h4>
            <p style={styles.helpText}>Send us your detailed questions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysioCareFAQ;