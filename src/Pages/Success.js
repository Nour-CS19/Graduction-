import React from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/images/icon-logo.png';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Panel */}
        <div className="col-md-6 d-none d-md-block p-5 text-white left-panel"
          style={{
            backgroundImage: "linear-gradient(rgba(13, 110, 253, 0.85), rgba(13, 110, 253, 0.85)), url('../assets/images/background3.jpg')",
            backgroundSize: "cover",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}>
          
          <div className="text-center mb-5">
            <img src={logo} alt="PhysioCare Logo" style={{ width: "120px", marginBottom: "2rem" }} />
            <h1 className="display-4 fw-bold">PhysioCare</h1>
            <p className="lead mt-3">Your Journey to Better Mobility</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <div className="card p-5 text-center shadow" style={{ 
            maxWidth: "500px", 
            width: "100%",
            borderRadius: "15px",
            border: "2px solid #0d6efd",
            backgroundColor: "rgba(245, 252, 255, 0.98)"
          }}>
            <h2 className="text-success mb-4" style={{ fontSize: "2rem" }}>
              🎉 Registration Successful!
            </h2>
            <p className="lead mb-4">
              Welcome to PhysioCare! Your account has been created successfully.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="btn btn-primary w-100 py-2"
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: "8px"
              }}
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;