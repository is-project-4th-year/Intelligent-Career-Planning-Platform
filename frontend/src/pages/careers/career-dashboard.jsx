import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css"; 
import api from "../../api"; // Ensure this is the correct API wrapper

const CareerDashboard = () => {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/user/"); 
        setUser(res.data);

        // Redirect if user is not a CareerMember
        if (res.data.role !== "CareerMember") {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/"); 
      }
    };

    fetchUserData();
  }, [navigate]);

  // Function to get initials from first_name and last_name
  const getInitials = (name) => {
    if (!name) return "U"; // Default Initial
    const names = name.split(" ");
    return names.map((n) => n[0].toUpperCase()).join("").slice(0, 2);
  };

  // Logout Function
  const handleLogout = () => {
    localStorage.clear(); // Remove tokens
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Career Dashboard</h2>
        <ul>
          <li>Dashboard</li>
          <li>Career Opportunities</li>
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
          <h1>Career Dashboard</h1>
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
          <div className="card">Placeholder 0000</div>
          <div className="card">Placeholder 0000</div>
          <div className="card">Placeholder 0000</div>
        </section>

        {/* Table */}
        <section className="table-section">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Software Engineer</td>
                <td>Google</td>
                <td>Remote</td>
                <td>Applied</td>
                <td>...</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default CareerDashboard;

