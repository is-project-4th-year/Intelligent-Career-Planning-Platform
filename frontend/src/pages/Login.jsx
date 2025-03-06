import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Auth.css";
import AuthBackground from "../components/AuthBackground";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Step 1: Authenticate and get the tokens
            const res = await api.post("/api/token/", { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

            // Step 2: Fetch user details
            const userRes = await api.get("/api/user/");
            const user = userRes.data;

            // Step 3: Redirect based on role
            if (user.role === "CareerMember") {
                navigate("/career-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="auth-container">
            <AuthBackground />
            <div className="auth-right">
                <h1>Welcome back!</h1>
                <p>Enter your Credentials to access your account</p>

                {error && <p className="error-message">{error}</p>}

                <form className="auth-form" onSubmit={handleLogin}>
                    <label>Email address</label>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    
                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    
                    <div className="auth-options">
                        <Link to="/forgot-password">Forgot password</Link>
                    </div>
                    
                    <button type="submit" className="login-btn">Login</button>
                </form>
            
                
                <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
            </div>
        </div>
    );
};

export default Login;
