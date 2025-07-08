import React, { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';

// Sample messages data (includes date property)
const initialMessages = [
  {
    id: 1,
    sender: 'Amy Lucier',
    content: 'In a free hour, when our power of choice is untrammeled...',
    fullContent: 'In a free hour, when our power of choice is untrammeled and when nothing prevents...',
    isRead: false,
    date: new Date('2023-03-10T09:30:00')
  },
  {
    id: 2,
    sender: 'Taneka White',
    content: 'The wise man therefore always holds in these matters...',
    fullContent: 'The wise man therefore always holds in these matters to this principle of selection...',
    isRead: true,
    date: new Date('2023-03-09T14:15:00')
  },
  {
    id: 3,
    sender: 'Nia Batts',
    content: 'No one rejects, dislikes, or avoids pleasure itself...',
    fullContent: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure...',
    isRead: false,
    date: new Date('2023-03-08T08:00:00')
  },
  {
    id: 4,
    sender: 'Gareb Barry',
    content: 'But because those who do not know how to pursue pleasure...',
    fullContent: 'But because those who do not know how to pursue pleasure rationally encounter consequences...',
    isRead: true,
    date: new Date('2023-03-07T16:45:00')
  },
  {
    id: 5,
    sender: 'Chris Potter',
    content: 'We denounce with righteous indignation...',
    fullContent: 'We denounce with righteous indignation and dislike men who are so beguiled...',
    isRead: false,
    date: new Date('2023-03-10T11:00:00')
  },
  // ... add more messages as needed
];

const DoctorMessages = () => {
  // States
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessages, setSelectedMessages] = useState([]); // array of IDs
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMessage, setDetailMessage] = useState(null); // which message is in detail

  // Compose form states
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'read' | 'unread'

  // Sorting states
  const [sortField, setSortField] = useState('date'); // 'date' or 'sender'
  const [sortOrder, setSortOrder] = useState('desc');  // 'asc' or 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ---- Filtering, Searching, Sorting ----
  const filteredMessages = useMemo(() => {
    let result = messages;

    // 1) Filter by read/unread
    if (filterStatus === 'read') {
      result = result.filter((m) => m.isRead);
    } else if (filterStatus === 'unread') {
      result = result.filter((m) => !m.isRead);
    }

    // 2) Search by sender or content
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.sender.toLowerCase().includes(queryLower) ||
          m.content.toLowerCase().includes(queryLower) ||
          m.fullContent.toLowerCase().includes(queryLower)
      );
    }

    // 3) Sort
    if (sortField === 'date') {
      result = result.sort((a, b) => {
        const dateA = a.date.getTime();
        const dateB = b.date.getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortField === 'sender') {
      result = result.sort((a, b) => {
        const senderA = a.sender.toLowerCase();
        const senderB = b.sender.toLowerCase();
        if (senderA < senderB) return sortOrder === 'asc' ? -1 : 1;
        if (senderA > senderB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [messages, filterStatus, searchQuery, sortField, sortOrder]);

  // ---- Pagination calculations ----
  const totalMessages = filteredMessages.length;
  const totalPages = Math.ceil(totalMessages / pageSize) || 1;
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const currentPageMessages = filteredMessages.slice(startIndex, startIndex + pageSize);

  // ---- Selecting messages ----
  const handleSelectMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = currentPageMessages.map((m) => m.id);
    const allSelected = currentPageIds.every((id) => selectedMessages.includes(id));
    if (allSelected) {
      // unselect all
      setSelectedMessages((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // select all
      setSelectedMessages((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // ---- Bulk actions ----
  const handleMarkAsRead = () => {
    setMessages((prev) =>
      prev.map((m) =>
        selectedMessages.includes(m.id) ? { ...m, isRead: true } : m
      )
    );
    setSelectedMessages([]);
  };

  const handleMarkAsUnread = () => {
    setMessages((prev) =>
      prev.map((m) =>
        selectedMessages.includes(m.id) ? { ...m, isRead: false } : m
      )
    );
    setSelectedMessages([]);
  };

  const handleDeleteSelected = () => {
    if (window.confirm('Are you sure you want to delete selected messages?')) {
      setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m.id)));
      setSelectedMessages([]);
    }
  };

  // ---- Compose modal ----
  const handleOpenCompose = () => {
    setShowComposeModal(true);
  };
  const handleCloseCompose = () => {
    setShowComposeModal(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
  };
  const handleSendMessage = () => {
    if (!composeRecipient || !composeSubject || !composeBody) {
      alert('Please fill out all fields.');
      return;
    }
    const newMessage = {
      id: messages.length + 1,
      sender: composeRecipient,
      content: composeSubject + ' - ' + composeBody.substring(0, 50) + '...',
      fullContent: composeBody,
      isRead: false,
      date: new Date()
    };
    setMessages([newMessage, ...messages]);
    handleCloseCompose();
  };

  // ---- Detail modal ----
  const handleOpenDetail = (msg) => {
    setDetailMessage(msg);
    setShowDetailModal(true);
    // Mark message as read
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
    );
  };
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setDetailMessage(null);
  };

  // ---- Pagination handler ----
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedMessages([]); // clear selections on page change
  };

  // Are all on page selected?
  const allOnPageSelected = currentPageMessages.every((m) => selectedMessages.includes(m.id));

  // ---- Utility for formatting date ----
  const formatDate = (dateObj) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return dateObj.toLocaleString(undefined, options);
  };

  // ---- Sorting toggles ----
  const handleSort = (field) => {
    if (sortField === field) {
      // toggle order
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container my-5">
      {/* Header row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h4 className="fw-bold mb-0">Messages</h4>
        <Button
          variant="primary"
          onClick={handleOpenCompose}
          style={{ backgroundColor: '#4A90E2', borderColor: '#4A90E2' }}
        >
          + Compose
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        {/* Reduced width + small border radius for search */}
        <div style={{ width: '250px' }}>
          <input
            type="text"
            className="form-control"
            style={{ borderRadius: '6px' }}
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <select
            className="form-select"
            style={{ borderRadius: '6px' }}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Bulk actions (only show if any selected) */}
      {selectedMessages.length > 0 && (
        <div className="mb-3 d-flex flex-wrap gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleMarkAsRead}
          >
            Mark as Read
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleMarkAsUnread}
          >
            Mark as Unread
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDeleteSelected}
          >
            Delete
          </Button>
        </div>
      )}

      {/* Messages Table (small border radius on container) */}
      <div className="table-responsive shadow-sm" style={{ borderRadius: '6px' }}>
        <table className="table mb-0 align-middle" style={{ borderRadius: '6px' }}>
          <thead className="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allOnPageSelected && currentPageMessages.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {/* Sortable columns */}
              <th
                onClick={() => handleSort('sender')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap', color: '#6c757d' }}
              >
                Sender
                {sortField === 'sender' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th style={{ width: '50%', color: '#212529' }}>Message Preview</th>
              <th
                onClick={() => handleSort('date')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap', color: '#6c757d' }}
              >
                Date
                {sortField === 'date' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPageMessages.map((msg) => (
              <tr
                key={msg.id}
                className={`${
                  !msg.isRead ? 'fw-semibold bg-light' : ''
                } hover:bg-gray-100 cursor-pointer`}
                onClick={() => handleOpenDetail(msg)}
                style={{ borderRadius: '6px' }}
              >
                <td
                  onClick={(e) => e.stopPropagation() /* don't open detail when clicking checkbox */}
                >
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(msg.id)}
                    onChange={() => handleSelectMessage(msg.id)}
                  />
                </td>
                {/* Sender name in muted color */}
                <td style={{ color: '#6c757d' }}>{msg.sender}</td>
                {/* Message content in darker color */}
                <td style={{ color: '#212529' }}>{msg.content}</td>
                <td style={{ color: '#6c757d' }}>{formatDate(msg.date)}</td>
              </tr>
            ))}
            {currentPageMessages.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 d-flex justify-content-between align-items-center">
        <div>
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalMessages)} of{' '}
          {totalMessages} entries
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPageSafe === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPageSafe - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${page === currentPageSafe ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => handlePageChange(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPageSafe === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPageSafe + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Compose Modal */}
      <Modal show={showComposeModal} onHide={handleCloseCompose}>
        <Modal.Header closeButton>
          <Modal.Title>Compose New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-semibold">To</label>
            <input
              type="text"
              className="form-control"
              value={composeRecipient}
              onChange={(e) => setComposeRecipient(e.target.value)}
              placeholder="Enter recipient name or email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Subject</label>
            <input
              type="text"
              className="form-control"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Message</label>
            <textarea
              rows="4"
              className="form-control"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Write your message..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCompose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetail}>
        <Modal.Header closeButton>
          <Modal.Title>Message Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailMessage ? (
            <>
              <p>
                <strong>From:</strong> {detailMessage.sender}
              </p>
              <p className="mb-2 text-muted">
                <small>{formatDate(detailMessage.date)}</small>
              </p>
              <div className="border p-3 rounded">
                {detailMessage.fullContent}
              </div>
            </>
          ) : (
            <p>No message selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DoctorMessages;
