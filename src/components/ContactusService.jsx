import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+20 2 1234 5678",
    bgColor: "bg-white"
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@physiocare-egypt.com",
    bgColor: "bg-white"
  },
  {
    icon: MapPin,
    label: "Location",
    value: "New Cairo, Cairo Governorate",
    bgColor: "bg-white"
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Sat-Thu: 9AM-7PM, Fri: 2PM-7PM",
    bgColor: "bg-white"
  }
];

const ContactUs = () => {
  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">Contact Us</h1>
            <p className="lead text-muted">
              Get in touch with us for any inquiries or support. We're here to help you!
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card bg-primary text-white border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="row">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <h3 className="fw-bold mb-4">Still Have Questions?</h3>
                    <p className="mb-4">
                      Can't find the answer you're looking for? Our friendly support team 
                      is here to help you with any questions about PhysioCare services.
                    </p>
                    <button className="btn btn-light btn-lg px-4 py-2">
                      Contact Support
                    </button>
                  </div>
                  <div className="col-lg-6">
                    <h5 className="fw-bold mb-3">Get In Touch</h5>
                    <div className="row g-3">
                      {contactInfo.map((contact, index) => {
                        const IconComponent = contact.icon;
                        return (
                          <div key={index} className="col-sm-6">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                <IconComponent size={20} />
                              </div>
                              <div>
                                <small className="opacity-75">{contact.label}</small>
                                <div className="fw-semibold">{contact.value}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;