import React, { useState } from 'react';

const PatientList = () => {
  // ----------------------------
  // Sample Patient Data
  // ----------------------------
  const initialPatients = [
    {
      name: 'Howard Tanner',
      gender: 'Male',
      age: 25,
      country: 'USA',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=31',
    },
    {
      name: 'Wendy Filson',
      gender: 'Female',
      age: 27,
      country: 'Canada',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=32',
    },
    {
      name: 'Faye Bridger',
      gender: 'Female',
      age: 30,
      country: 'USA',
      diagnosis: 'Cancer',
      avatarUrl: 'https://i.pravatar.cc/80?img=33',
    },
    {
      name: 'Ronald Curtis',
      gender: 'Male',
      age: 29,
      country: 'UK',
      diagnosis: 'Diabetes',
      avatarUrl: 'https://i.pravatar.cc/80?img=34',
    },
    {
      name: 'Melissa Hibner',
      gender: 'Female',
      age: 26,
      country: 'USA',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=35',
    },
    {
      name: 'Randall Case',
      gender: 'Male',
      age: 32,
      country: 'USA',
      diagnosis: 'Diabetes',
      avatarUrl: 'https://i.pravatar.cc/80?img=36',
    },
    {
      name: 'Jerry Morena',
      gender: 'Male',
      age: 35,
      country: 'USA',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=37',
    },
    {
      name: 'Lester McNally',
      gender: 'Male',
      age: 40,
      country: 'USA',
      diagnosis: 'Cancer',
      avatarUrl: 'https://i.pravatar.cc/80?img=38',
    },
    {
      name: 'Christopher Burrell',
      gender: 'Male',
      age: 24,
      country: 'Canada',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=39',
    },
    {
      name: 'Mary Skeens',
      gender: 'Female',
      age: 29,
      country: 'USA',
      diagnosis: 'Heart Attack',
      avatarUrl: 'https://i.pravatar.cc/80?img=40',
    },
  ];

  // ----------------------------
  // Component State
  // ----------------------------
  const [patients] = useState(initialPatients);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // items per page

  // ----------------------------
  // Derived Data
  // ----------------------------
  const filteredPatients =
    selectedCategory === 'All'
      ? patients
      : patients.filter((p) => p.diagnosis === selectedCategory);

  const totalRecords = filteredPatients.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredPatients.slice(startIndex, endIndex);

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Patients List</h1>

      {/* Category Filter */}
      <div className="flex space-x-3 mb-6">
        {['All', 'Heart Attack', 'Cancer', 'Diabetes'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded text-sm border ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentData.map((patient, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded shadow-sm p-4 flex flex-col items-center text-center"
          >
            {/* 3-dot button in top-right */}
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6h.01M12 12h.01M12 18h.01"
                />
              </svg>
            </button>

            {/* Avatar */}
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-16 h-16 rounded-full mb-2"
            />
            {/* Name */}
            <h3 className="font-semibold text-gray-700">{patient.name}</h3>

            {/* Info */}
            <p className="text-sm text-gray-500 mt-1">Gender: {patient.gender}</p>
            <p className="text-sm text-gray-500">Age: {patient.age}Year</p>
            <p className="text-sm text-gray-500">Country: {patient.country}</p>
            <p className="text-sm text-gray-500">Diagnosis: {patient.diagnosis}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {startIndex + 1} - {Math.min(endIndex, totalRecords)} out of {totalRecords}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                currentPage === p ? 'bg-blue-600 text-white border-blue-600' : ''
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
