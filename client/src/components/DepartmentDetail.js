import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './List.css';

const DepartmentDetail = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [department, setDepartment] = useState({});
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const { deptId } = useParams(); // Get department ID from URL

  // Fetch department details, courses, and instructors on component mount or when deptId changes
  useEffect(() => {
    // Fetch department details
    axios.get(`/api/dept`)
      .then(response => {
        const filteredDept = response.data.filter(dept => dept.dept_id === deptId);
        if (filteredDept.length > 0) {
          setDepartment(filteredDept[0]);
        }
      })
      .catch(error => console.error('Error fetching department details:', error));

    // Fetch courses
    axios.get('/api/course')
      .then(response => {
        const filteredCourses = response.data.filter(course => course.dept === deptId);
        setCourses(filteredCourses);
      })
      .catch(error => console.error('Error fetching courses:', error));

    // Fetch instructors
    axios.get('/api/instructor')
      .then(response => {
        const filteredInstructors = response.data.filter(instructor => instructor.dept === deptId);
        setInstructors(filteredInstructors);
      })
      .catch(error => console.error('Error fetching instructors:', error));
  }, [deptId]);

  // Update search term state based on user input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Get the sort direction indicator for each column
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return ' ↕'; // Neutral icon
  };

  // Request a sort based on the selected column
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'neutral';
    }
    if (direction === 'neutral') {
      setSortConfig({ key: null, direction: 'ascending' });
    } else {
      setSortConfig({ key, direction });
    }
  };

  const calculateWithdrawRate = (withdraw, enrollment) => {
    if (enrollment === 0) return 0; // Avoid division by zero
    return (withdraw / enrollment) * 100; // Return a numeric value
  };

  const sortedCourses = React.useMemo(() => {
    let sortableItems = [...courses];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for withdraw_rate
        if (sortConfig.key === 'withdraw_rate') {
          aValue = calculateWithdrawRate(a.withdraw, a.enrollment);
          bValue = calculateWithdrawRate(b.withdraw, b.enrollment);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [courses, sortConfig]);


  const filteredAndSortedCourses = sortedCourses.filter(course =>
    course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInstructors = React.useMemo(() => {
    let sortableItems = [...instructors];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for withdraw_rate
        if (sortConfig.key === 'withdraw_rate') {
          aValue = calculateWithdrawRate(a.withdraw, a.enrollment);
          bValue = calculateWithdrawRate(b.withdraw, b.enrollment);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [instructors, sortConfig]);


  const filteredAndSortedInstructors = sortedInstructors.filter(instructor =>
    instructor.instructor_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGPATextColor = (gpa) => {
    if (gpa > 3) {
      return 'green'; 
    } else if (gpa < 3) {
      return 'red'; 
    } else {
      return 'black'; 
    }
  };
  return (
    <div>
      <h2>{department.dept_id} - {department.title}</h2>
      <button onClick={() => setActiveTab('courses')}>Courses</button>
      <button onClick={() => setActiveTab('instructors')}>Instructors</button>

      {activeTab === 'courses' && (
        <div>
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('course_id')}>ID{getSortDirectionIndicator('course_id')}</th>
                <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
                <th onClick={() => requestSort('credits')}>Credits{getSortDirectionIndicator('credits')}</th>
                <th onClick={() => requestSort('gpa')}>GPA{getSortDirectionIndicator('gpa')}</th>
                <th onClick={() => requestSort('enrollment')}>Enrollment{getSortDirectionIndicator('enrollment')}</th>
                <th onClick={() => requestSort('withdraw')}>Withdraw{getSortDirectionIndicator('withdraw')}</th>
                <th onClick={() => requestSort('withdraw_rate')}>Withdraw Rate{getSortDirectionIndicator('withdraw_rate')}</th>
                <th onClick={() => requestSort('past_classes')}>Past Classes{getSortDirectionIndicator('past_classes')}</th>
                <th onClick={() => requestSort('new_classes')}>New Classes{getSortDirectionIndicator('new_classes')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCourses.map(course => (
                <tr key={course.course_id}>
                  <td>
                   <Link to={`/course/${course.course_id}`} className="dept-link">{course.course_id}</Link>
                  </td> 
                  <td>{course.title}</td>
                  <td>{course.credits}</td>
                  <td style={{ color: getGPATextColor(course.gpa) }}>{course.gpa.toFixed(2)}</td>
                  <td>{course.enrollment.toFixed(2)}</td>
                  <td>{course.withdraw.toFixed(2)}</td>
                  <td>{calculateWithdrawRate(course.withdraw, course.enrollment).toFixed(2)}%</td>
                  <td>{course.past_classes}</td>
                  <td>{course.new_classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'instructors' && (
        <div>
          <input
            type="text"
            placeholder="Search by Last Name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('last_name')}>Last Name{getSortDirectionIndicator('last_name')}</th>
                <th onClick={() => requestSort('gpa')}>GPA{getSortDirectionIndicator('gpa')}</th>
                <th onClick={() => requestSort('enrollment')}>Enrollment{getSortDirectionIndicator('enrollment')}</th>
                <th onClick={() => requestSort('withdraw')}>Withdraw{getSortDirectionIndicator('withdraw')}</th>
                <th onClick={() => requestSort('withdraw_rate')}>Withdraw Rate{getSortDirectionIndicator('withdraw_rate')}</th>
                <th onClick={() => requestSort('past_classes')}>Past Classes{getSortDirectionIndicator('past_classes')}</th>
                <th onClick={() => requestSort('new_classes')}>New Classes{getSortDirectionIndicator('new_classes')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInstructors.map(instructor => (
                <tr key={instructor.instructor_id}>
                  <td>{instructor.last_name}</td>
                  <td style={{ color: getGPATextColor(instructor.gpa) }}>{instructor.gpa.toFixed(2)}</td>
                  <td>{instructor.enrollment.toFixed(2)}</td>
                  <td>{calculateWithdrawRate(instructor.withdraw, instructor.enrollment).toFixed(2)}%</td>
                  <td>{instructor.past_classes}</td>
                  <td>{instructor.new_classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
