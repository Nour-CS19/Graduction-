import React, { useState } from 'react';

const ImprovedSidebar = ({ isSidebarOpen, setIsSidebarOpen, setActiveView, activeView }) => {
  const [expandedDropdown, setExpandedDropdown] = useState(null);

  // Menu structure with dropdowns
  const menuData = [
    {
      label: 'Dashboard',
      view: 'dashboard',
      icon: <i className="bi bi-house fs-5"></i>,
      isDropdown: false
    },
    {
      label: 'Booking',
      icon: <i className="bi bi-calendar-plus fs-5"></i>,
      isDropdown: true,
      items: [
        { label: 'Accept/Reject', view: 'accept-reject', icon: <i className="bi bi-check2-circle fs-5"></i> },
        { label: 'Booking Form', view: 'doctor-form', icon: <i className="bi bi-file-earmark-medical fs-5"></i> }
      ]
    },
    {
      label: 'Appointments',
      icon: <i className="bi bi-calendar-check fs-5"></i>,
      isDropdown: true,
      items: [
        { label: 'Home Appts', view: 'home-appointments', icon: <i className="bi bi-house-door fs-5"></i> },
        { label: 'All Appts', view: 'appointments', icon: <i className="bi bi-calendar-check fs-5"></i> },
        { label: 'Online Appts', view: 'online-appointments', icon: <i className="bi bi-laptop fs-5"></i> }
      ]
    },
    {
      label: 'Clinics',
      icon: <i className="bi bi-building fs-5"></i>,
      isDropdown: true,
      items: [
        { label: 'All Clinics', view: 'clinics', icon: <i className="bi bi-building fs-5"></i> },
        { label: 'Clinic Mgmt', view: 'clinic-management', icon: <i className="bi bi-building-gear fs-5"></i> }
      ]
    },
    {
      label: 'Chat',
      view: 'chat',
      icon: <i className="bi bi-chat-dots fs-5"></i>,
      isDropdown: false
    },
    {
      label: 'Patients',
      view: 'patients',
      icon: <i className="bi bi-people fs-5"></i>,
      isDropdown: false
    },
    {
      label: 'Profile',
      view: 'profile',
      icon: <i className="bi bi-person fs-5"></i>,
      isDropdown: false
    }
  ];

  const toggleDropdown = (dropdownLabel) => {
    if (expandedDropdown === dropdownLabel) {
      setExpandedDropdown(null);
    } else {
      setExpandedDropdown(dropdownLabel);
    }
  };

  const handleMenuItemClick = (view) => {
    setActiveView(view);
  };

  return (
    <aside 
      className={`bg-primary text-white d-flex flex-column transition-all ${isSidebarOpen ? 'p-3' : 'p-0'}`} 
      style={{ 
        width: isSidebarOpen ? '220px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s ease-in-out'
      }}
    >
      {isSidebarOpen && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Menu</h5>
            <button 
              className="btn btn-sm text-white" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <ul className="nav nav-pills flex-column mb-auto">
            {menuData.map((item, index) => (
              <li key={index} className="nav-item mb-2">
                {item.isDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="nav-link text-white d-flex justify-content-between align-items-center w-100"
                      style={{ border: 'none', outline: 'none' }}
                    >
                      <div className="d-flex align-items-center">
                        {item.icon}
                        <span className="ms-2">{item.label}</span>
                      </div>
                      <i className={`bi ${expandedDropdown === item.label ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                    </button>
                    
                    {expandedDropdown === item.label && (
                      <ul className="nav flex-column ms-3 mt-2">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex} className="nav-item mb-2">
                            <button
                              onClick={() => handleMenuItemClick(subItem.view)}
                              className={`nav-link text-white d-flex align-items-center ${
                                activeView === subItem.view ? 'active bg-secondary' : 'bg-transparent'
                              }`}
                              style={{ border: 'none', outline: 'none' }}
                            >
                              {subItem.icon}
                              <span className="ms-2">{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleMenuItemClick(item.view)}
                    className={`nav-link text-white d-flex align-items-center ${
                      activeView === item.view ? 'active bg-secondary' : 'bg-transparent'
                    }`}
                    style={{ border: 'none', outline: 'none' }}
                  >
                    {item.icon}
                    <span className="ms-2">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto">
            <button className="btn btn-link text-white d-flex align-items-center" title="Logout">
              <i className="bi bi-box-arrow-right fs-5"></i>
              <span className="ms-2">Logout</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default ImprovedSidebar;