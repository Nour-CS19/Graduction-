import React, { useState } from 'react';

const DoctorProfileSettings = () => {
  // States for personal info
  const [profilePic, setProfilePic] = useState(null);
  const [firstName, setFirstName] = useState('Calvin');
  const [lastName, setLastName] = useState('Carlo');
  const [email, setEmail] = useState('doctor@calvin.com');
  const [phone, setPhone] = useState('+1 234 567 890');
  const [address, setAddress] = useState('1234 Medical Street, City, Country');
  const [dob, setDob] = useState('1985-06-15'); // Example
  const [gender, setGender] = useState('Male'); // Example
  const [specialty, setSpecialty] = useState('Orthopedic');

  // States for changing password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States for schedule
  const [schedule, setSchedule] = useState({
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  });

  // Notifications
  const [accountNotifications, setAccountNotifications] = useState({
    whenSomeoneFollowsMe: true,
    whenSomeoneMessagesMe: true,
    whenSomeonePosts: false,
  });
  const [marketingNotifications, setMarketingNotifications] = useState({
    newsPromo: true,
    weeklyTips: true,
    unsubscribeNews: false,
  });

  // Handle image upload
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle schedule changes
  const handleScheduleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // Handle form submissions
  const handlePersonalInfoSubmit = (e) => {
    e.preventDefault();
    // Perform update logic or API calls
    alert('Personal information saved!');
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    // Validate & update password
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match!');
      return;
    }
    alert('Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    // Confirm and delete account
    if (window.confirm('Are you sure you want to delete your account?')) {
      alert('Account deleted!');
    }
  };

  return (
    <div className="container my-5">
      <h3 className="mb-4 fw-bold">Profile Settings</h3>

      {/* Row 1: Personal Info & Schedule */}
      <div className="row mb-4">
        {/* Personal Information */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Personal Information</h5>
              <form onSubmit={handlePersonalInfoSubmit}>
                {/* Upload Picture (custom Browse button) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Profile Picture</label>
                  <div className="d-flex align-items-center">
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="border rounded-circle d-flex justify-content-center align-items-center me-3"
                        style={{ width: '60px', height: '60px' }}
                      >
                        <i className="bi bi-person fs-3 text-muted"></i>
                      </div>
                    )}

                    {/* Custom Browse button with hover style */}
                    <div className="position-relative">
                      <label
                        htmlFor="profilePicInput"
                        className="btn"
                        style={{
                          backgroundColor: '#4A90E2',
                          color: '#fff',
                          borderColor: '#4A90E2',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#3B7ECC')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#4A90E2')}
                      >
                        Browse
                      </label>
                      <input
                        id="profilePicInput"
                        type="file"
                        className="form-control d-none"
                        onChange={handleProfilePicChange}
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>

                {/* Name, Email, Phone, Address, plus extra fields */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Phone No.</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Gender</label>
                    <select
                      className="form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Specialty</label>
                    <input
                      type="text"
                      className="form-control"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Schedule Timing */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Schedule Timing</h5>
              <div className="table-responsive mb-3">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(schedule).map(([day, times]) => (
                      <tr key={day}>
                        <td className="text-capitalize fw-semibold">{day}</td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={times.start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={times.end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => alert('Schedule saved!')}
                className="btn btn-primary"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Change Password & Notifications */}
      <div className="row mb-4">
        {/* Change Password */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Change Password</h5>
              <form onSubmit={handlePasswordChangeSubmit}>
                <div className="row">
                  {/* Make them wider by using col-12 or col-6, etc. */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Old Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ minWidth: '100%' }}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ minWidth: '100%' }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ minWidth: '100%' }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Notifications (Account & Marketing) */}
        <div className="col-lg-6">
          {/* Account Notifications */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Account Notifications</h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="followNotification"
                  checked={accountNotifications.whenSomeoneFollowsMe}
                  onChange={(e) =>
                    setAccountNotifications((prev) => ({
                      ...prev,
                      whenSomeoneFollowsMe: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="followNotification">
                  When someone follows me
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="messageNotification"
                  checked={accountNotifications.whenSomeoneMessagesMe}
                  onChange={(e) =>
                    setAccountNotifications((prev) => ({
                      ...prev,
                      whenSomeoneMessagesMe: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="messageNotification">
                  When someone messages me
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="postNotification"
                  checked={accountNotifications.whenSomeonePosts}
                  onChange={(e) =>
                    setAccountNotifications((prev) => ({
                      ...prev,
                      whenSomeonePosts: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="postNotification">
                  When someone posts
                </label>
              </div>
            </div>
          </div>

          {/* Marketing Notifications */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Marketing Notifications</h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="newsPromo"
                  checked={marketingNotifications.newsPromo}
                  onChange={(e) =>
                    setMarketingNotifications((prev) => ({
                      ...prev,
                      newsPromo: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="newsPromo">
                  Receive news & promotions
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="weeklyTips"
                  checked={marketingNotifications.weeklyTips}
                  onChange={(e) =>
                    setMarketingNotifications((prev) => ({
                      ...prev,
                      weeklyTips: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="weeklyTips">
                  Weekly tips
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="unsubscribeNews"
                  checked={marketingNotifications.unsubscribeNews}
                  onChange={(e) =>
                    setMarketingNotifications((prev) => ({
                      ...prev,
                      unsubscribeNews: e.target.checked
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="unsubscribeNews">
                  Unsubscribe from news
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Delete Account */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Delete Account</h5>
              <p className="text-muted">
                Do you really want to delete the account? Press the "Delete" button below.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileSettings;
