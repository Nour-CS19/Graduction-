import React, { useState } from 'react';

/**
 * Example "InvoicePage" component:
 * 1) Displays a table of invoices with ID, name+avatar, phone, amount, date, status.
 * 2) Includes pagination (Prev, page numbers, Next).
 * 3) Clicking "View" shows a small pop-up box with invoice details.
 * 4) "Print" button simulates a printing action (via alert).
 * 5) The background remains from the app (no large overlay).
 */
const InvoicePage = () => {
  // -------------------------------
  // Sample Data
  // -------------------------------
  const initialData = [
    {
      id: 1,
      name: 'Melissa Hibner',
      phone: '(+1) 285-4527-7568',
      amount: '$458',
      date: '5th May 2023',
      status: 'Paid',
      avatarUrl: 'https://i.pravatar.cc/40?img=11',
    },
    {
      id: 2,
      name: 'Randall Case',
      phone: '(+1) 285-4527-7568',
      amount: '$558',
      date: '19th June 2023',
      status: 'Paid',
      avatarUrl: 'https://i.pravatar.cc/40?img=12',
    },
    {
      id: 3,
      name: 'Jerry Morena',
      phone: '(+1) 285-4527-7568',
      amount: '$625',
      date: '20th June 2023',
      status: 'Unpaid',
      avatarUrl: 'https://i.pravatar.cc/40?img=13',
    },
    {
      id: 4,
      name: 'Lester McNally',
      phone: '(+1) 285-4527-7568',
      amount: '$547',
      date: '31st Aug 2023',
      status: 'Paid',
      avatarUrl: 'https://i.pravatar.cc/40?img=14',
    },
    {
      id: 5,
      name: 'Christopher Burrell',
      phone: '(+1) 285-4527-7568',
      amount: '$586',
      date: '1st Sep 2023',
      status: 'Unpaid',
      avatarUrl: 'https://i.pravatar.cc/40?img=15',
    },
    {
      id: 6,
      name: 'Mary Skeens',
      phone: '(+1) 285-4527-7568',
      amount: '$549',
      date: '10th Sep 2023',
      status: 'Paid',
      avatarUrl: 'https://i.pravatar.cc/40?img=16',
    },
    // Add more records if you want to test pagination
  ];

  // -------------------------------
  // Component State
  // -------------------------------
  const [data] = useState(initialData);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // items per page

  // "View" Pop-up
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);

  // -------------------------------
  // Derived
  // -------------------------------
  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowPopUp(true);
  };

  const handlePrint = (record) => {
    alert(`Printing invoice for ${record.name} (#${record.id})...`);
  };

  const closePopUp = () => {
    setShowPopUp(false);
    setSelectedRecord(null);
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentData.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 text-sm text-gray-500">#{String(record.id).padStart(2, '0')}</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <img
                    src={record.avatarUrl}
                    alt={record.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{record.name}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{record.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{record.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{record.date}</td>
                <td className="px-4 py-3 text-sm">
                  {record.status === 'Paid' ? (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Unpaid
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <button
                    onClick={() => handleView(record)}
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handlePrint(record)}
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded"
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
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

      {/* Small Pop-up "View" Box (No big overlay) */}
      {showPopUp && selectedRecord && (
        <div
          className="
            absolute top-1/2 left-1/2 
            transform -translate-x-1/2 -translate-y-1/2 
            z-50 bg-white shadow-lg border border-gray-200 
            w-[300px] p-4 rounded
          "
        >
          <h2 className="text-lg font-semibold mb-2">Invoice Info</h2>
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={selectedRecord.avatarUrl}
              alt={selectedRecord.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">{selectedRecord.name}</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Phone:</strong> {selectedRecord.phone}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Amount:</strong> {selectedRecord.amount}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Date:</strong> {selectedRecord.date}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            <strong>Status:</strong>{' '}
            {selectedRecord.status === 'Paid' ? (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Paid
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                Unpaid
              </span>
            )}
          </p>

          <div className="text-right">
            <button
              onClick={closePopUp}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
