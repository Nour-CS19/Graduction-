
/*

import React from 'react';
import { FaHeartbeat, FaFlask, FaStethoscope, FaXRay } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Image from 'C:/Users/NOUR SOFT/Desktop/Graduction Final/First/src/assets/images/price-bg.png';

const Specializations = () => {
  const items = [
    { icon: <FaHeartbeat />, label: 'Cardiology', link: '/cardiology' },
    { icon: <FaFlask />, label: 'Laboratory', link: '/laboratory' },
    { icon: <FaStethoscope />, label: 'Primary Care', link: '/primary-care' },
    { icon: <FaXRay />, label: 'X-Ray', link: '/x-ray' },
  ];

  return (
    <section
      className="specializations py-5 position-relative"
      style={{
        backgroundImage: `url(${Image})`, // خلفية الصورة
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '10px', // حواف ناعمة
        padding: '40px',
        position: 'relative', // لإظهار watermark فوق الخلفية
      }}
    >
      {}
      <div
        style={{
          position: 'absolute',
          color:'',
          bottom: '20px', 
          right: '10px', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          transform: 'rotate(-45deg)', 
          zIndex: 1, 
        }}
      >
      </div>

      <div className="container">
        <h2
          className="text-center mb-4"
          style={{
            color: '#ffffff',
            fontWeight: 'bold', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            width: 'fit-content', 
            margin: '0 auto', 
          }}
        >
          Find By Specialisation
        </h2>

        <div className="row">
          {items.map((item, index) => (
            <div key={index} className="col-md-4 col-lg-3 text-center mb-4">
              <Link to={item.link} style={{ textDecoration: 'none' }}>
                <div
                  className="card p-4 shadow"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // خلفية البطاقات شفافة قليلاً
                    borderRadius: '12px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div className="mb-3" style={{ fontSize: '2.5rem', color: '#007bff' }}>
                    {item.icon}
                  </div>
                  <h5 style={{ color: '#333', fontWeight: '500' }}>{item.label}</h5>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specializations;


*/