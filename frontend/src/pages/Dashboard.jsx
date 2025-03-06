import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/dashboard.css";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/user/");
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
    };

    const confirmLogout = () => {
        setShowLogoutModal(true); // Show the confirmation modal
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <h1 className="dashboard-title">Welcome, {user?.first_name || "User"}!</h1>
                {user ? (
                    <div className="dashboard-user-info">
                        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}
                <button onClick={confirmLogout} className="dashboard-logout-btn">Logout</button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Are you sure you want to log out?</h3>
                        <div className="modal-buttons">
                            <button onClick={handleLogout} className="confirm-btn">Yes, Logout</button>
                            <button onClick={() => setShowLogoutModal(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
