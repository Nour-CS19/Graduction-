import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";

const ScheduleTiming = () => {
  // --------------------------
  // State for calendar events
  // --------------------------
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: "1",
      title: "Existing Event",
      start: new Date().toISOString().split("T")[0],
      allDay: true,
    },
  ]);

  // State for modals
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // State for new event form in the "Add Event" modal
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    allDay: false,
  });

  // State for the selected event details (when an event is clicked)
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --------------------------
  // Calendar Handlers
  // --------------------------
  const handleDateClick = (arg) => {
    setNewEvent({
      title: "",
      date: arg.dateStr,
      time: "",
      allDay: true,
    });
    setShowAddEventModal(true);
  };

  const handleEventReceive = (info) => {
    // Not used in this version (no external events)
  };

  const handleEventDrop = (info) => {
    const updatedEvents = calendarEvents.map((evt) =>
      evt.id === info.event.id
        ? { ...evt, start: info.event.start, end: info.event.end, allDay: info.event.allDay }
        : evt
    );
    setCalendarEvents(updatedEvents);
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      allDay: info.event.allDay,
    });
    setShowEventDetailsModal(true);
  };

  // --------------------------
  // "Add Event" Modal Handler
  // --------------------------
  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    let startStr = newEvent.date;
    if (newEvent.time) {
      startStr += "T" + newEvent.time;
    }
    const newCalEvent = {
      id: String(Date.now()),
      title: newEvent.title || "Untitled Event",
      start: startStr,
      allDay: newEvent.allDay,
    };
    setCalendarEvents((prev) => [...prev, newCalEvent]);
    setShowAddEventModal(false);
    setNewEvent({ title: "", date: "", time: "", allDay: false });
  };

  // --------------------------
  // Delete Event Handler
  // --------------------------
  const handleDeleteEvent = (id) => {
    setCalendarEvents(calendarEvents.filter((evt) => evt.id !== id));
    setShowDeleteConfirmModal(false);
    setShowEventDetailsModal(false);
    setSelectedEvent(null);
  };

  // --------------------------
  // Custom day cell class: mark cell red if an event exists on that day
  // --------------------------
  const dayCellClassNames = (arg) => {
    const eventExists = calendarEvents.some((evt) => {
      const evtDate = new Date(evt.start);
      return (
        evtDate.getFullYear() === arg.date.getFullYear() &&
        evtDate.getMonth() === arg.date.getMonth() &&
        evtDate.getDate() === arg.date.getDate()
      );
    });
    return eventExists ? ["bg-red-200"] : [];
  };

  // --------------------------
  // Render Modals
  // --------------------------
  const renderAddEventModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
        <form onSubmit={handleAddEventSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Event Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Time (optional)</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newEvent.allDay}
              onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
            />
            <label>All Day</label>
          </div>
          <div className="text-right space-x-2">
            <button
              type="button"
              onClick={() => setShowAddEventModal(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEventDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
        {selectedEvent && (
          <>
            <h3 className="text-xl font-semibold mb-4">Event Details</h3>
            <p>
              <strong>Title:</strong> {selectedEvent.title}
            </p>
            <p>
              <strong>Start:</strong> {selectedEvent.start.toString()}
            </p>
            <p>
              <strong>All Day:</strong> {selectedEvent.allDay ? "Yes" : "No"}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderDeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-red-100 border border-red-600 w-full max-w-md rounded shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-700">Confirm Deletion</h3>
        <p className="mb-4">Are you sure you want to delete this event?</p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeleteEvent(selectedEvent.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // --------------------------
  // Main Render
  // --------------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Calendar Area */}
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Schedule Timing</h2>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrapPlugin]}
          initialView="dayGridMonth"
          themeSystem="bootstrap"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          weekends={true}
          editable={true}
          droppable={true}
          selectable={true}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          eventClick={(info) => {
            handleEventClick(info);
            setShowEventDetailsModal(true);
          }}
          dayCellClassNames={dayCellClassNames}
        />
      </main>

      {/* Render Modals */}
      {showAddEventModal && renderAddEventModal()}
      {showEventDetailsModal && renderEventDetailsModal()}
      {showDeleteConfirmModal && renderDeleteConfirmModal()}
    </div>
  );
};

export default ScheduleTiming;
