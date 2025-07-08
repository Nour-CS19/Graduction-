import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const ChartsOverview = ({ data }) => {
  const chartData = {
    labels: ["Doctors", "Labs", "Nurses", "Patients"],
    datasets: [
      {
        label: "Count",
        data: [data.doctors, data.labs, data.nurses, data.patients],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#17a2b8"],
        borderColor: "#ddd",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="charts-container">
      <h4 className="text-center mb-4">Overview Charts</h4>
      <div className="chart-wrapper mb-5">
        <h5 className="text-center">Bar Chart</h5>
        <Bar data={chartData} />
      </div>
      <div className="chart-wrapper mb-5">
        <h5 className="text-center">Line Chart</h5>
        <Line data={chartData} />
      </div>
      <div className="chart-wrapper mb-5">
        <h5 className="text-center">Pie Chart</h5>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default ChartsOverview;
