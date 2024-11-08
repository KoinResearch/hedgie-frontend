import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Auth.css";

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        console.log("Registering user with the following details:");
        console.log("Email:", email);
        console.log("Username:", username);
        console.log("Password:", password);
        console.log("Confirm Password:", confirmPassword);

        if (password !== confirmPassword) {
            console.warn("Passwords do not match");
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post('${import.meta.env.VITE_API_URL}/api/register', {
                email,
                username,
                password
            });

            console.log("Server response:", response.data);

            if (response.data.success) {
                console.log("Registration successful, navigating to sign in page.");
                navigate('/signin');
            } else {
                console.warn("Registration failed:", response.data.message);
                alert(response.data.message);
            }
        } catch (error) {
            console.error("There was an error registering!", error);
            alert("Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <h1>Create an account</h1>
            <form onSubmit={handleRegister} className="auth-form">
                <input
                    type="email"
                    placeholder="E-mail Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
};

export default Register;
