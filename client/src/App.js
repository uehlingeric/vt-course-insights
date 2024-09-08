import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DepartmentList from './components/DepartmentList';
import DepartmentDetail from './components/DepartmentDetail';
import CourseDetail from './components/CourseDetail';
import InstructorDetail from './components/InstructorDetail';
import Header from './components/Header';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserPage from './components/UserPage';
import Schedule from './components/Schedule'; 


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUser] = useState('');
  const [role, setRole] = useState('');

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Clear token from storage
    localStorage.removeItem('username'); // Clear username from storage
    setIsAuthenticated(false);
    setUser(''); // Clear username
    setRole(''); // Clear role
  };


  return (
    <Router>
      <div>
        <Header isAuthenticated={isAuthenticated} handleSignOut={handleSignOut} username={username} />
        <main style={{ padding: '20px' }}>
          <section>
            <p>Welcome to VTCourseInisghts! This web app provides detailed information about courses, departments, and instructors from the past 5 years at Virginia Tech.</p>
          </section>
          <Routes>
            <Route path="/" element={<DepartmentList />} />
            <Route path="/department/:deptId" element={<DepartmentDetail />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/instructor/:instructorId" element={<InstructorDetail />} />
            <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} setUser={setUser} setRole={setRole} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/user" element={<UserPage username={username} role={role} />} />
            <Route path="/schedule" element={<Schedule username={username} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
