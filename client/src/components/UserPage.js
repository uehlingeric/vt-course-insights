import React, { useState } from 'react';

const UserPage = ({ username, role }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');

    // Handles the password change process
    const handleChangePassword = async () => {
        // Check if the new password and confirmation match
        if (newPassword !== confirmNewPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            // Send a POST request to change the user's password
            const response = await fetch('http://localhost:5000/api/user/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Retrieve the token from localStorage
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Password changed successfully');
            } else {
                alert(data.message || 'Error changing password');
            }
        } catch (error) {
            console.error('Change password error', error);
        }
    };

    // Handles the creation of a new admin user
    const handleCreateAdmin = async () => {
        try {
            // Send a POST request to create a new admin user
            const response = await fetch('http://localhost:5000/api/user/createAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('New admin created successfully');
            } else {
                alert(data.message || 'Error creating admin');
            }
        } catch (error) {
            console.error('Create admin error', error);
        }
    };

    return (
        <div>
            <h2>User Page</h2>
            <p>Username: {username}</p>
            <p>Role: {role}</p>

            <div>
                <h3>Change Password</h3>
                <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button onClick={handleChangePassword}>Change Password</button>
            </div>

            {/* Render the admin creation section only for admin users */}
            {role === 'admin' && (
                <div>
                    <h3>Create New Admin</h3>
                    <input
                        type="text"
                        placeholder="New Admin Username"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Admin Password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                    />
                    <button onClick={handleCreateAdmin}>Create Admin</button>
                </div>
            )}
        </div>
    );
};

export default UserPage;
