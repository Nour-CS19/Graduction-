import React from "react";

const Features = () => {
  const features = [
    { icon: "bi bi-person-fill", title: "Qualified Doctors", description: "Experienced professionals at your service." },
    { icon: "bi bi-briefcase-fill", title: "Emergency Care", description: "Available 24/7 for emergencies." },
    { icon: "bi bi-building", title: "Modern Clinics", description: "State-of-the-art facilities." },
    { icon: "bi bi-heart-fill", title: "Patient Support", description: "Compassionate care for everyone." },
  ];

  return (
    <div className="features-section py-5">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div className="col-md-3 text-center" key={index}>
              <i className={`${feature.icon} text-primary mb-3`} style={{ fontSize: "2rem" }}></i>
              <h5 className="mb-2">{feature.title}</h5>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
