// menuConfig.js
export const menuConfig = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Hub', 
      icon: 'bi-house-door-fill', 
      view: 'dashboard', 
      level: 'top', 
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: 'bi-calendar-heart-fill',
      level: 'dropdown',
      color: '#10B981',
      items: [
        { label: 'Online Sessions', view: 'appointmentsOnline', icon: 'bi-camera-video' },
        { label: 'Clinic Visits', view: 'appointmentAtClinics', icon: 'bi-hospital' },
        { label: 'Home Care', view: 'appointmentAtHome', icon: 'bi-house-heart' },
      ],
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: 'bi-bookmark-star-fill',
      level: 'dropdown',
      color: '#F59E0B',
      items: [
        { label: 'All Bookings', view: 'fetchAll', icon: 'bi-list-ul' },
        { label: 'Clinic Bookings', view: 'fetchAllAtClinic', icon: 'bi-building' },
        { label: 'Online Bookings', view: 'fetchAllAtOnline', icon: 'bi-laptop' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'bi-person-circle',
      level: 'dropdown',
      color: '#8B5CF6',
      items: [
        { label: 'Edit Profile', view: 'editProfile', icon: 'bi-pencil-square' },
        { label: 'Settings', view: 'settings', icon: 'bi-gear' },
      ],
    },
    { 
      id: 'chat', 
      label: 'Messages', 
      icon: 'bi-chat-dots-fill', 
      view: 'chat', 
      level: 'top', 
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
    },
    {
      id: 'clinics',
      label: 'Clinics',
      icon: 'bi-hospital-fill',
      level: 'dropdown',
      color: '#EF4444',
      items: [
        { label: 'My Clinics', view: 'clinics', icon: 'bi-building-check' },
      ],
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: 'bi-graph-up-arrow', 
      view: 'analytics', 
      level: 'top', 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
  ];