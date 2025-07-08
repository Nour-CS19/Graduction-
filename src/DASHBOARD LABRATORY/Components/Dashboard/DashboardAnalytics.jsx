import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

const DashboardAnalytics = ({ dischargeList, newPatients, totalPatients }) => {
  const analytics = [
    {
      icon: faClipboardCheck,
      label: "Today's Discharge List",
      value: dischargeList,
      bgClass: 'bg-primary'
    },
    {
      icon: faUserPlus,
      label: "New Patients",
      value: newPatients,
      bgClass: 'bg-danger'
    },
    {
      icon: faUsers,
      label: "Total Patients",
      value: totalPatients,
      bgClass: 'bg-info'
    }
  ];
  return (
    <div className="row g-3 mb-4">
      {analytics.map((item, index) => (
        <div key={index} className="col-md-4">
          <div className="card stats-card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className={`icon-circle ${item.bgClass} text-white me-3`} style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div>
                <p className="mb-1 text-muted">{item.label}</p>
                <h5 className="mb-0 fw-bold">{item.value}</h5>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardAnalytics;
