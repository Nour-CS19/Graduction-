import React from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => (
  <div className="col-md-6 col-lg-3 mb-4">
    <div className="card h-100 p-3" style={{ borderRadius: '10px', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="text-muted mb-2">{title}</h6>
          <h4 className="mb-0 fw-bold" style={{ color }}>{value}</h4>
          {trend !== undefined && (
            <small className="text-muted">
              <i className={`bi bi-arrow-${trend > 0 ? 'up' : 'down'} me-1`} style={{ color: trend > 0 ? '#32CD32' : '#FF4500' }}></i>
              {Math.abs(trend)}% vs last month
            </small>
          )}
        </div>
        <div className="rounded-circle bg-light p-2" style={{ background: `${color}20` }}>
          <i className={`bi ${icon}`} style={{ fontSize: '24px', color }}></i>
        </div>
      </div>
    </div>
  </div>
);

export default StatsCard;