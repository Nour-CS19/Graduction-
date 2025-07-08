import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Header = ({ title }) => {
  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm bg-white">
      <h4 className="mb-0 fw-bold">{title}</h4>
      <div className="d-flex align-items-center">
        <div className="me-3 text-end">
          <small className="text-muted d-block">Welcome!</small>
          <strong>Nurse Jeniffer Turner</strong>
        </div>
        <div 
          className="avatar bg-primary text-white d-flex align-items-center justify-content-center" 
          style={{ width: '45px', height: '45px', borderRadius: '50%' }}
        >
          <FontAwesomeIcon icon={faUser} />
        </div>
      </div>
    </header>
  );
};

export default Header;
