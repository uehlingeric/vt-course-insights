import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = ({ setIsAuthenticated, setUser, setRole }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Handles the sign-in form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send a POST request to the server for authentication
            const response = await fetch('http://localhost:5000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.token) {
                // Store the token and username in local storage and update authentication state
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                setIsAuthenticated(true);
                setUser(data.username);
                setRole(data.role);
                navigate('/'); // Navigate to the home page after successful login
            } else {
                // Display an error message if authentication fails
                alert(data.message || 'Error logging in');
            }
        } catch (error) {
            console.error('Login error', error);
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default SignIn;
