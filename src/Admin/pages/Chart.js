
import React from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Row, Col } from 'react-bootstrap';

ChartJS.register(...registerables);

const Dashboard = () => {
  const cardData = [
    { id: 1, label: 'Total Users', value: 277, percentage: '+95%', color: 'green', icon: '👤' },
    { id: 2, label: 'Total Orders', value: 388, percentage: '-30%', color: 'purple', icon: '🛒' },
    { id: 3, label: 'Total Products', value: 577, percentage: '-25%', color: 'blue', icon: '📦' },
    { id: 4, label: 'Total Reviews', value: 166, percentage: '+45%', color: 'yellow', icon: '✨' },
  ];

  const barData = {
    labels: ['Users', 'Orders', 'Products', 'Reviews'],
    datasets: [
      {
        label: 'Counts',
        data: [277, 388, 577, 166],
        backgroundColor: ['#28a745', '#e83e8c', '#007bff', '#ffc107'],
      },
    ],
  };

  const pieData = {
    labels: ['Users', 'Orders', 'Products', 'Reviews'],
    datasets: [
      {
        data: [277, 388, 577, 166],
        backgroundColor: ['#28a745', '#e83e8c', '#007bff', '#ffc107'],
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Monthly Growth',
        data: [50, 75, 150, 200, 300],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Users', 'Orders', 'Products', 'Reviews'],
    datasets: [
      {
        data: [277, 388, 577, 166],
        backgroundColor: ['#28a745', '#e83e8c', '#007bff', '#ffc107'],
      },
    ],
  };

  return (
    <div className="main-content">
      <h2>Admin Dashboard</h2>

      {/* Cards Section */}
      <Row className="chart-row">
        {cardData.map((card) => (
          <Col key={card.id} md={6} sm={12} className="chart-col">
            <div className={`chart-card ${card.color}`}>
              <span className="chart-icon">{card.icon}</span>
              <div className="chart-label">{card.label}</div>
              <div className="chart-value">{card.value}</div>
              <div className="chart-percentage">{card.percentage} Last Month</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row className="chart-row">
        {/* Bar Chart */}
        <Col md={6} sm={12} className="chart-col">
          <div className="chart-card">
            <h4 className="text-center">Bar Chart</h4>
            <Bar data={barData} />
          </div>
        </Col>

        {/* Pie Chart */}
        <Col md={6} sm={12} className="chart-col">
          <div className="chart-card">
            <h4 className="text-center">Pie Chart</h4>
            <Pie data={pieData} />
          </div>
        </Col>

        {/* Line Chart */}
        <Col md={6} sm={12} className="chart-col">
          <div className="chart-card">
            <h4 className="text-center">Line Chart</h4>
            <Line data={lineData} />
          </div>
        </Col>

        {/* Doughnut Chart */}
        <Col md={6} sm={12} className="chart-col">
          <div className="chart-card">
            <h4 className="text-center">Doughnut Chart</h4>
            <Doughnut data={doughnutData} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
