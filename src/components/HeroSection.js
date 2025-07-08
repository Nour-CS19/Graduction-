import React, { useRef, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import Typed from "typed.js";

// Example images – adjust or replace these
import newSlider1 from "../assets/images/telemedicine-6166814_1280.jpg";
import newSlider2 from "../assets/images/inner-side-banner.png";
import newSlider3 from "../assets/images/doctor-6161898_1280.jpg";
import newSlider4 from "../assets/images/computer-1149148_1280.jpg";

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
};

const typedTextStyle = {
  fontSize: "2rem",
  fontWeight: 600,
  color: "#fff",
  textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
  zIndex: 2,
};

const slideStyle = (bg) => ({
  width: "100%",
  height: "400px",
  position: "relative",
  backgroundImage: `url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const TypedHeroSection = () => {
  // Store multiple refs in an array
  const typedRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const typedOptions = {
      strings: ["Stay Healthy", "Achieve Wellness", "Live Better"],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    };

    // Create a Typed instance for each ref
    const typedInstances = typedRefs.map(
      (ref) => new Typed(ref.current, typedOptions)
    );

    // Destroy all instances on unmount
    return () => {
      typedInstances.forEach((instance) => instance.destroy());
    };
  }, []);

  return (
    <>
      <Box sx={{ textAlign: "center", py: 3, backgroundColor: "#ffffff" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0d6efd" }}>
          Our Innovative Approach
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", mt: 1 }}>
          See our solutions in action with our dynamic carousel.
        </Typography>
      </Box>

      <Carousel
        indicators={false}
        interval={3000}
        controls={false}
        style={{ width: "100%", height: "400px" }}
      >
        <Carousel.Item>
          <div style={slideStyle(newSlider1)}>
            <Box sx={overlayStyle}></Box>
            <h2 style={typedTextStyle}>
              Helping You <span ref={typedRefs[0]}></span>
            </h2>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div style={slideStyle(newSlider2)}>
            <Box sx={overlayStyle}></Box>
            <h2 style={typedTextStyle}>
              Helping You <span ref={typedRefs[1]}></span>
            </h2>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div style={slideStyle(newSlider3)}>
            <Box sx={overlayStyle}></Box>
            <h2 style={typedTextStyle}>
              Helping You <span ref={typedRefs[2]}></span>
            </h2>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div style={slideStyle(newSlider4)}>
            <Box sx={overlayStyle}></Box>
            <h2 style={typedTextStyle}>
              Helping You <span ref={typedRefs[3]}></span>
            </h2>
          </div>
        </Carousel.Item>
      </Carousel>
    </>
  );
};

export default TypedHeroSection;
