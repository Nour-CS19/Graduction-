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
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/dist/css/Home.css";
const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setZoomLevel(1);
  };
  const closeImageModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
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
          <div className="row align-items-center w-100 g-4">
            <div className="col-lg-6 col-md-12 text-column order-2 order-lg-1">
              <h1 className="hero-heading display-4 fw-bold text-dark mb-3">
                Your Health,
                <br />
                <span style={{ color: "#00d4ff" }}>Our Priority</span>
              </h1>
              <p className="lead mb-4 text-muted hero-description">
                Connect with top healthcare professionals across Elmenofia. Book
                appointments, get consultations, and manage your health journey
                with ease.
              </p>
              <div className="buttons-container d-flex gap-3 flex-wrap">
                <Link
                  to="/contact"
                  className="btn btn-outline-primary rounded-pill py-2 px-4 btn-responsive"
                  aria-label="Learn more about our services"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 position-relative order-1 order-lg-2">
              <div className="phones-container">
                <img
                  src={bg}
                  alt="PhysioCare App - Home Screen"
                  className="phone phone-left"
                  onClick={() => openImageModal(bg)}
                  style={{ cursor: 'pointer' }}
                />
                <img
                  src={bg1}
                  alt="PhysioCare App - Onboarding"
                  className="phone phone-center"
                  onClick={() => openImageModal(bg1)}
                  style={{ cursor: 'pointer' }}
                />
                <img
                  src={bg2}
                  alt="PhysioCare App - Start Screen"
                  className="phone phone-right"
                  onClick={() => openImageModal(bg2)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div className="wave-bg"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={closeImageModal}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeImageModal}>
              <X size={24} />
            </button>
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomOut}>
                <ZoomOut size={20} />
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button className="zoom-btn" onClick={handleZoomIn}>
                <ZoomIn size={20} />
              </button>
            </div>
            <div className="image-wrapper">
              <div className="image-container">
                <img
                  src={selectedImage}
                  alt="Enlarged view"
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="modal-image"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        /* Image Modal Styles */
        .image-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 20px;
          box-sizing: border-box;
        }
        .image-modal-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .modal-close-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10001;
          backdrop-filter: blur(10px);
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        .modal-close-btn:active {
          transform: scale(0.95);
        }
        .zoom-controls {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          align-items: center;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 20px;
          border-radius: 30px;
          backdrop-filter: blur(10px);
          z-index: 10000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .zoom-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .zoom-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        .zoom-btn:active {
          transform: scale(0.9);
        }
        .zoom-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .zoom-btn:disabled:hover {
          transform: none;
        }
        .zoom-level {
          color: white;
          font-size: 15px;
          font-weight: 600;
          min-width: 60px;
          text-align: center;
        }
        .image-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding-bottom: 100px;
          -webkit-overflow-scrolling: touch;
          position: relative;
        }
        .image-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100%;
          min-height: 100%;
        }
        .modal-image {
          display: block;
          max-width: 90vw;
          max-height: 70vh;
          width: auto;
          height: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
          border-radius: 8px;
          user-select: none;
          -webkit-user-drag: none;
          transform-origin: center center;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        /* Modal Responsive Styles */
        
        /* Large Desktop */
        @media (min-width: 1400px) {
          .modal-close-btn {
            top: 30px;
            right: 30px;
            width: 48px;
            height: 48px;
          }
         
          .zoom-controls {
            bottom: 40px;
            padding: 12px 24px;
          }
         
          .zoom-btn {
            width: 40px;
            height: 40px;
          }
        }
        /* Tablet Landscape (768px - 1199px) */
        @media (min-width: 768px) and (max-width: 1199px) {
          .image-modal-overlay {
            padding: 15px;
          }
          .modal-close-btn {
            top: 15px;
            right: 15px;
            width: 42px;
            height: 42px;
          }
          .zoom-controls {
            bottom: 25px;
            padding: 10px 18px;
            gap: 10px;
          }
          .zoom-btn {
            width: 34px;
            height: 34px;
          }
          .zoom-level {
            font-size: 14px;
            min-width: 55px;
          }
          .modal-image {
            max-width: 85vw;
            max-height: 65vh;
          }
        }
        /* Tablet Portrait & Mobile Landscape (576px - 767px) */
        @media (max-width: 767px) {
          .image-modal-overlay {
            padding: 10px;
          }
          .modal-close-btn {
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
          }
          .zoom-controls {
            bottom: 20px;
            padding: 8px 16px;
            gap: 8px;
          }
          .zoom-btn {
            width: 32px;
            height: 32px;
          }
          .zoom-level {
            font-size: 13px;
            min-width: 50px;
          }
          .image-wrapper {
            padding-bottom: 80px;
          }
          .modal-image {
            max-width: 88vw;
            max-height: 60vh;
          }
        }
        /* Mobile Portrait (up to 575px) */
        @media (max-width: 575px) {
          .image-modal-overlay {
            padding: 8px;
          }
          .modal-close-btn {
            top: 8px;
            right: 8px;
            width: 38px;
            height: 38px;
          }
          .zoom-controls {
            bottom: 15px;
            padding: 6px 14px;
            gap: 6px;
          }
          .zoom-btn {
            width: 30px;
            height: 30px;
          }
          .zoom-level {
            font-size: 12px;
            min-width: 45px;
          }
          .image-wrapper {
            padding-bottom: 70px;
          }
          .modal-image {
            max-width: 90vw;
            max-height: 55vh;
          }
        }
        /* Extra Small Mobile (up to 400px) */
        @media (max-width: 400px) {
          .image-modal-overlay {
            padding: 5px;
          }
          .modal-close-btn {
            top: 5px;
            right: 5px;
            width: 36px;
            height: 36px;
          }
          .zoom-controls {
            bottom: 10px;
            padding: 6px 12px;
            gap: 5px;
          }
          .zoom-btn {
            width: 28px;
            height: 28px;
          }
          .zoom-level {
            font-size: 11px;
            min-width: 40px;
          }
          .image-wrapper {
            padding-bottom: 60px;
          }
          .modal-image {
            max-width: 92vw;
            max-height: 50vh;
          }
        }
        /* Landscape orientation on mobile */
        @media (max-height: 600px) and (orientation: landscape) {
          .image-modal-overlay {
            padding: 5px;
          }
          .modal-close-btn {
            top: 5px;
            right: 5px;
            width: 34px;
            height: 34px;
          }
          .zoom-controls {
            bottom: 10px;
            padding: 5px 12px;
          }
          .zoom-btn {
            width: 28px;
            height: 28px;
          }
          .zoom-level {
            font-size: 11px;
          }
          .image-wrapper {
            padding-bottom: 55px;
          }
        }
        /* Very short screens */
        @media (max-height: 500px) {
          .zoom-controls {
            bottom: 5px;
            padding: 4px 10px;
          }
          .image-wrapper {
            padding-bottom: 50px;
          }
        }
        /* Base Styles */
        .hero-section {
          padding: 20px 0;
        }
        .text-column {
          padding: 20px;
        }
        .hero-heading {
          font-size: clamp(2rem, 5vw, 3.5rem);
          line-height: 1.2;
          animation: slideInRight 0.8s ease-out;
        }
        .hero-description {
          font-size: clamp(1rem, 2vw, 1.25rem);
          line-height: 1.6;
          animation: slideInRight 1s ease-out;
        }
        .btn-responsive {
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          transition: all 0.3s ease;
          animation: slideInRight 1.2s ease-out;
        }
        /* Phones Container */
        .phones-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 450px;
          padding: 30px 20px;
          width: 100%;
          margin: 0 auto;
          animation: slideInLeft 0.8s ease-out;
        }
        .phone {
          position: absolute;
          width: 180px;
          height: auto;
          border-radius: 25px;
          box-shadow: none;
          transition: none;
          object-fit: cover;
        }
        .phone-left {
          left: 8%;
          z-index: 1;
          transform: rotate(-8deg);
          animation: float 3s ease-in-out infinite;
        }
        .phone-center {
          left: 50%;
          z-index: 3;
          transform: translateX(-50%) scale(1.1);
          animation: float 3s ease-in-out infinite 0.5s;
        }
        .phone-right {
          right: 8%;
          z-index: 2;
          transform: rotate(8deg);
          animation: float 3s ease-in-out infinite 1s;
        }
        .phone:hover {
          transform: scale(1.05) translateY(-10px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
        }
        .wave-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20%;
          background: url('https://www.transparenttextures.com/patterns/wave.png');
          opacity: 0.1;
          pointer-events: none;
        }
        /* Animations */
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
           0%, 100% {
             transform: translateY(0);
           }
           50% {
             transform: translateY(-15px);
           }
        }
        /* Apply float animation to specific phones */
        .phone-left {
          animation: floatLeft 3s ease-in-out infinite;
        }
        .phone-center {
          animation: floatCenter 3s ease-in-out infinite 0.5s;
        }
        .phone-right {
          animation: floatRight 3s ease-in-out infinite 1s;
        }
        @keyframes floatLeft {
          0%, 100% {
            transform: rotate(-8deg) translateY(0);
          }
          50% {
            transform: rotate(-8deg) translateY(-15px);
          }
        }
        @keyframes floatCenter {
          0%, 100% {
            transform: translateX(-50%) scale(1.1) translateY(0);
          }
          50% {
            transform: translateX(-50%) scale(1.1) translateY(-15px);
          }
        }
        @keyframes floatRight {
          0%, 100% {
            transform: rotate(8deg) translateY(0);
          }
          50% {
            transform: rotate(8deg) translateY(-15px);
          }
        }
        /* Large Desktop (1400px and above) */
        @media (min-width: 1400px) {
          .phones-container {
            min-height: 500px;
            padding: 40px 30px;
          }
          .phone {
            width: 210px;
          }
          .phone-left {
            left: 10%;
            transform: rotate(-8deg);
          }
          .phone-center {
            transform: translateX(-50%) scale(1.15);
          }
          .phone-right {
            right: 10%;
            transform: rotate(8deg);
          }
        }
        /* Desktop (1200px - 1399px) */
        @media (min-width: 1200px) and (max-width: 1399px) {
          .phones-container {
            min-height: 470px;
            padding: 35px 25px;
          }
          .phone {
            width: 195px;
          }
          .phone-left {
            left: 9%;
            transform: rotate(-8deg);
          }
          .phone-center {
            transform: translateX(-50%) scale(1.12);
          }
          .phone-right {
            right: 9%;
            transform: rotate(8deg);
          }
        }
        /* Laptop (992px - 1199px) */
        @media (min-width: 992px) and (max-width: 1199px) {
          .phones-container {
            min-height: 430px;
            padding: 30px 20px;
          }
          .phone {
            width: 170px;
          }
          .phone-left {
            left: 6%;
            transform: rotate(-6deg);
          }
          .phone-center {
            transform: translateX(-50%) scale(1.08);
          }
          .phone-right {
            right: 6%;
            transform: rotate(6deg);
          }
        }
        /* Tablet (768px - 991px) */
        @media (max-width: 991px) {
          .hero-section {
            min-height: auto;
            padding: 40px 0;
          }
          .text-column {
            text-align: center;
            padding: 30px 20px;
          }
          .buttons-container {
            justify-content: center;
          }
          .phones-container {
            min-height: 380px;
            margin-top: 30px;
            max-width: 100%;
          }
          .phone {
            width: 150px;
          }
          .phone-left {
            left: 12%;
            transform: translateX(-50%) rotate(-3deg);
          }
          .phone-center {
            left: 50%;
            transform: translateX(-50%) scale(1.05);
          }
          .phone-right {
            right: 12%;
            transform: translateX(50%) rotate(3deg);
          }
        }
        /* Mobile Landscape (576px - 767px) */
        @media (max-width: 767px) {
          .hero-section {
            padding: 30px 0;
          }
          .phones-container {
            min-height: 320px;
            padding: 10px;
            max-width: 100%;
          }
          .phone {
            width: 130px;
            border-radius: 20px;
          }
          .phone-left {
            left: 8%;
            transform: translateX(-50%) rotate(-3deg);
          }
          .phone-center {
            left: 50%;
            transform: translateX(-50%) scale(1.05);
          }
          .phone-right {
            right: 8%;
            transform: translateX(50%) rotate(3deg);
          }
          .hero-heading {
            margin-bottom: 1.5rem;
          }
          .hero-description {
            margin-bottom: 2rem;
          }
          .modal-close-btn {
            top: 10px;
            right: 10px;
          }
        }
        /* Mobile Portrait (up to 575px) */
        @media (max-width: 575px) {
          .hero-section {
            padding: 20px 0;
          }
          .text-column {
            padding: 20px 15px;
          }
          .phones-container {
            min-height: 280px;
            padding: 10px 5px;
            max-width: 100%;
          }
          .phone {
            width: 110px;
            border-radius: 18px;
          }
          .phone-left {
            left: 5%;
            transform: translateX(-50%) rotate(-3deg) scale(0.95);
          }
          .phone-center {
            left: 50%;
            transform: translateX(-50%) scale(1);
          }
          .phone-right {
            right: 5%;
            transform: translateX(50%) rotate(3deg) scale(0.95);
          }
          .btn-responsive {
            padding: 0.5rem 1.5rem;
          }
        }
        /* Extra Small Mobile (up to 400px) */
        @media (max-width: 400px) {
          .phones-container {
            min-height: 250px;
            padding: 5px 0;
            max-width: 100%;
          }
          .phone {
            width: 95px;
            border-radius: 15px;
          }
          .phone-left {
            left: 2%;
            transform: translateX(-50%) rotate(-2deg) scale(0.9);
          }
          .phone-center {
            left: 50%;
            transform: translateX(-50%) scale(0.95);
          }
          .phone-right {
            right: 2%;
            transform: translateX(50%) rotate(2deg) scale(0.9);
          }
          .hero-heading {
            margin-bottom: 1rem;
          }
          .hero-description {
            margin-bottom: 1.5rem;
          }
        }
        /* Landscape orientation on mobile */
        @media (max-height: 600px) and (orientation: landscape) {
          .hero-section {
            min-height: auto;
            padding: 30px 0;
          }
          .phones-container {
            min-height: 280px;
          }
          .phone {
            width: 130px;
          }
          .text-column {
            padding: 20px;
          }
        }
        /* iPad Pro Portrait */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
          .phones-container {
            min-height: 500px;
          }
          .phone {
            width: 200px;
          }
        }
        /* iPad Pro Landscape */
        @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
          .phones-container {
            min-height: 450px;
          }
          .phone {
            width: 210px;
          }
        }
        /* Remove float animation on low-performance devices */
        @media (prefers-reduced-motion: reduce) {
          .phone {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
export default Home;