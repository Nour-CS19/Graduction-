import React, { useState } from 'react';
import { menuConfig } from './MenuConfig';

const ProfessionalSidebar = ({ isSidebarOpen, setIsSidebarOpen, activeView, setActiveView, handleLogout, userName, notifications }) => {
  const [expandedDropdown, setExpandedDropdown] = useState(null);

  const toggleDropdown = (itemId) => {
    setExpandedDropdown(expandedDropdown === itemId ? null : itemId);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed w-full h-full bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className="fixed h-full shadow-lg z-50"
        style={{
          width: isSidebarOpen ? '260px' : '70px',
          transition: 'width 0.3s ease',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
          borderRight: '1px solid #E0E0E0',
        }}
      >
        {isSidebarOpen && (
          <div className="p-3 border-b border-[#E0E0E0] bg-[#009DA5]">
            <div className="flex items-center">
              <div className="relative">
                <div className="rounded-full bg-white p-3 mr-3 shadow-sm">
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: '20px' }}></i>
                </div>
                <div className="absolute bottom-0 right-0 bg-success rounded-full w-3 h-3 border-2 border-white"></div>
              </div>
              <div className="text-white">
                <h6 className="mb-0 fw-semibold">Dr. {userName}</h6>
              </div>
            </div>
          </div>
        )}
        <div className="p-3 flex items-center justify-center h-[calc(100vh-150px)] overflow-y-auto">
          <nav className="flex flex-col space-y-2 w-full">
            {menuConfig.map((item) => (
              <div key={item.id} className="mb-2">
                {item.level === 'top' && (
                  <button
                    className="btn w-full text-start p-2 rounded-lg flex items-center justify-center transition-all sidebar-icon"
                    onClick={() => item.view ? setActiveView(item.view) : (item.id === 'logout' && handleLogout())}
                    style={{
                      background: activeView === item.view ? 'linear-gradient(135deg, #009DA5 0%, #00b3bc 100%)' : 'transparent',
                      color: activeView === item.view ? '#FFFFFF' : '#495057',
                      border: 'none',
                      transform: activeView === item.view ? 'translateX(5px)' : 'translateX(0)',
                      boxShadow: activeView === item.view ? '0 4px 12px rgba(0, 157, 165, 0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (activeView !== item.view) {
                        e.target.style.background = '#F0F4F8';
                        e.target.style.transform = 'translateX(3px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeView !== item.view) {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <i className={`bi ${item.icon} me-3`} style={{ fontSize: '18px', color: activeView === item.view ? '#FFFFFF' : item.color }}></i>
                    {isSidebarOpen && <span className="fw-medium">{item.label}</span>}
                  </button>
                )}
                {item.level === 'dropdown' && (
                  <div>
                    <button
                      className="btn w-full text-start p-2 rounded-lg flex items-center justify-center"
                      onClick={() => toggleDropdown(item.id)}
                      style={{
                        background: item.items.some(i => activeView === i.view) ? 'linear-gradient(135deg, #009DA5 0%, #00b3bc 100%)' : 'transparent',
                        color: item.items.some(i => activeView === i.view) ? '#FFFFFF' : '#495057',
                        border: 'none',
                        boxShadow: item.items.some(i => activeView === i.view) ? '0 4px 12px rgba(0, 157, 165, 0.3)' : 'none',
                      }}
                    >
                      <div className="flex items-center">
                        <i className={`bi ${item.icon} me-3`} style={{ fontSize: '18px', color: item.items.some(i => activeView === i.view) ? '#FFFFFF' : item.color }}></i>
                        {isSidebarOpen && <span className="fw-medium">{item.label}</span>}
                      </div>
                      {isSidebarOpen && <i className={`bi bi-chevron-${expandedDropdown === item.id ? 'up' : 'down'}`} />}
                    </button>
                    {isSidebarOpen && expandedDropdown === item.id && (
                      <div className="ms-4 mt-2">
                        {item.items.map((subItem) => (
                          <button
                            key={subItem.view}
                            className="btn w-full text-start p-2 rounded-lg"
                            onClick={() => setActiveView(subItem.view)}
                            style={{
                              background: activeView === subItem.view ? 'rgba(0, 157, 165, 0.1)' : 'transparent',
                              color: activeView === subItem.view ? '#009DA5' : '#6C757D',
                              fontSize: '14px',
                              border: 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <i className={`bi ${subItem.icon} me-2`} style={{ fontSize: '14px', color: activeView === subItem.view ? '#009DA5' : item.color }}></i>
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        {isSidebarOpen && notifications.length > 0 && (
          <div className="p-3 border-t border-[#E0E0E0]">
            <h6 className="mb-2 fw-semibold text-primary">Notifications</h6>
            <div className="list-group">
              {notifications.map((msg, index) => (
                <a key={index} href="#" className="list-group-item list-group-item-action" style={{ background: '#F8F9FA', borderColor: '#E9ECEF' }}>
                  <div className="d-flex w-100 justify-content-between">
                    <small className="mb-1 text-muted">{msg}</small>
                    <span className="badge bg-primary rounded-pill">New</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfessionalSidebar;