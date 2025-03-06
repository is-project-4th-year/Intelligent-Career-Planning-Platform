import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import api from "../../api"; // Ensure this is the correct API wrapper

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/user/"); 
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/"); 
      }
    };

    fetchUserData();
  }, [navigate]);
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.map((n) => n[0].toUpperCase()).join("").slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Student Dashboard</h2>
        <ul>
          <li>Dashboard</li>
          <li>Mentorship</li>
          <li>E-Learning</li>
          <li>Internships</li>
          <li>Settings</li>
        </ul>

        {/* User Profile */}
        {user && (
          <div className="user-profile">
            <div className="profile-pic">{getInitials(user.first_name + " " + user.last_name)}</div>
            <div className="user-info">
              <p className="user-name">{user.first_name} {user.last_name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Student Dashboard</h1>
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="new-entry-button">New Entry</button>
          <button className="logout-button" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button className="confirm-btn" onClick={handleLogout}>Yes, Logout</button>
                <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="card">Enrolled Courses: 4</div>
          <div className="card">Active Mentorships: 2</div>
          <div className="card">Internship Applications: 3</div>
        </section>

        {/* Table */}
        <section className="table-section">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Mentor</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Full-Stack Web Development</td>
                <td>Jane Smith</td>
                <td>70%</td>
                <td>Ongoing</td>
                <td>...</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
