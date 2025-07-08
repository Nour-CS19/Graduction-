import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/Nav";
import bg from "../assets/images/Home 6-portrait.png";
import bg1 from "../assets/images/3_Onboarding 2-portrait.png";
import bg2 from "../assets/images/Start 1-portrait.png";
import {
  ChevronDown,
  Search,
  User,
  Video,
  Home as HomeIcon,
  Beaker,
  UserCheck,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/dist/css/Home.css";

const Home = () => {
  return (
    <div>
      <NavBar />
      {/* Hero Section */}
      <div
        className="container-fluid hero-section"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container py-5 h-100 d-flex align-items-center">
          <div className="row align-items-center w-100">
            <div className="col-lg-6 text-column">
              <h1 className="hero-heading display-4 fw-bold text-dark mb-3">
                Your Health,
                <br />
                <span style={{ color: "#00d4ff" }}>Our Priority</span>
              </h1>
              <p className="lead mb-4 text-muted" style={{ fontSize: "1.25rem" }}>
                Connect with top healthcare professionals across Elmenofia. Book
                appointments, get consultations, and manage your health journey
                with ease.
              </p>
              <div className="buttons-container d-flex gap-3 flex-wrap">
                <Link
                  to="/contact"
                  className="btn btn-outline-primary rounded-pill py-2 px-4"
                  aria-label="Learn more about our services"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="col-lg-6 position-relative">
              <div className="phones-container d-flex justify-content-end">
                <img
                  src={bg}
                  alt="PhysioCare App - Home Screen"
                  className="phone phone-left"
                  style={{ transform: "translateX(-20%)" }}
                />
                <img
                  src={bg1}
                  alt="PhysioCare App - Onboarding"
                  className="phone phone-center"
                />
                <img
                  src={bg2}
                  alt="PhysioCare App - Start Screen"
                  className="phone phone-right"
                  style={{ transform: "translateX(20%)" }}
                />
              </div>
              <div
                className="wave-bg"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "20%",
                  background: "url(https://www.transparenttextures.com/patterns/wave.png)",
                  opacity: 0.1,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;