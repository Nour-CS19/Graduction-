import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGooglePlay, FaApple, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import bg from '../assets/images/003b6a45-7816-4519-850c-43afbd8fe09e_removalai_preview.png';

const DownloadApp = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const headingText = "Download Our Mobile App";
  
  const letterVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.5
      }
    }
  };

  const underlineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "20%",
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: headingText.length * 0.05 + 0.2
      }
    }
  };

  const indicatorVariants = {
    x: ["-100%", "500%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear"
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setZoomLevel(1);
  };

  return (
    <>
      <section className="download-app position-relative py-5" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Main Heading */}
        <div className="text-center mb-5" style={{ position: 'relative' }}>
          <motion.h1
            className="display-3 fw-bold text-dark heading-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'inline-block', position: 'relative' }}
          >
            {headingText.split('').map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                custom={index}
                style={{ display: 'inline-block' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>
          <motion.div
            className="underline"
            variants={underlineVariants}
            initial="hidden"
            animate="visible"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-8px',
              transform: 'translateX(-50%)',
              height: '3px',
              background: 'linear-gradient(90deg, #0d6efd, #0d6efd)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <motion.div
              animate={indicatorVariants}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '15%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '2px',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
              }}
            />
          </motion.div>
        </div>
        
        <div className="container">
          <motion.div className="row align-items-center" layout>
            {/* Image on the left */}
            <div className="col-lg-6 mb-4 mb-lg-0 text-center">
              <motion.img
                src={bg}
                alt="App Preview"
                className="img-fluid rounded app-image"
                layout
                style={{ 
                  maxHeight: '300px', 
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
                onClick={() => setIsDialogOpen(true)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <p className="mt-2 small text-muted">Click to view full size</p>
            </div>
            {/* Text and buttons on the right */}
            <div className="col-lg-6 text-center text-lg-start">
              <h2 className="display-4 fw-bold text-dark mb-4">
                Access Your Health Journey
              </h2>
              <p className="lead text-muted mb-4">
                Access your health information, stay updated with the latest reports, and manage your care seamlessly on the go.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <motion.a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark btn-lg d-flex align-items-center justify-content-center px-4 py-2 shadow"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <FaGooglePlay className="me-2" size={20} />
                  Google Play
                </motion.a>
                <motion.a
                  href="https://www.apple.com/app-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg d-flex align-items-center justify-content-center px-4 py-2 shadow"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <FaApple className="me-2" size={20} />
                  App Store
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Background decoration */}
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ zIndex: -1 }}>
          <svg className="w-100 h-100" viewBox="0 0 1440 320">
           <path
             fill="#e9ecef"
             fillOpacity="1"
             d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,213.3C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
           ></path>
          </svg>
        </div>
        <style jsx>{`
          .download-app {
            overflow: hidden;
          }
          /* Typography for main heading */
          .display-3 {
            font-family: 'system-ui', -apple-system, sans-serif;
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
            color: #212529;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Heading container for underline positioning */
          .heading-container {
            position: relative;
            display: inline-block;
          }
          /* Ensure buttons are accessible */
          .btn:focus {
            outline: 2px solid #0d6efd;
            outline-offset: 2px;
          }
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .display-3 {
              font-size: 3rem;
            }
            .display-4 {
              font-size: 2.5rem;
            }
            .lead {
              font-size: 1rem;
            }
            .app-image {
              max-width: 300px;
            }
            .d-flex {
              flex-direction: column;
              gap: 1rem;
            }
          }
          @media (max-width: 576px) {
            .display-3 {
              font-size: 2.5rem;
            }
            .display-4 {
              font-size: 2rem;
            }
            .lead {
              font-size: 0.9rem;
            }
            .app-image {
              max-width: 250px;
            }
            .btn-lg {
              padding: 0.5rem 1rem;
              font-size: 1rem;
            }
          }
        `}</style>
      </section>

      {/* Image Dialog Modal */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={handleCloseDialog}
          >
            {/* Control Panel */}
            <div
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                display: 'flex',
                gap: '10px',
                zIndex: 10001
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomOut}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#fff',
                  color: '#000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  fontSize: '18px'
                }}
                aria-label="Zoom out"
              >
                <FaMinus />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomIn}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#fff',
                  color: '#000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  fontSize: '18px'
                }}
                aria-label="Zoom in"
              >
                <FaPlus />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseDialog}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#fff',
                  color: '#000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  fontSize: '18px'
                }}
                aria-label="Close"
              >
                <FaTimes />
              </motion.button>
            </div>

            {/* Zoom Level Indicator */}
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '20px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '14px',
                zIndex: 10001
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {Math.round(zoomLevel * 100)}%
            </div>

            {/* Image Container */}
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={bg}
                alt="App Preview - Full Size"
                initial={{ scale: 0.8 }}
                animate={{ scale: zoomLevel }}
                exit={{ scale: 0.8 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DownloadApp;