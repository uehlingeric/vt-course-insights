import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './List.css';

const Schedule = ({ username }) => {
  const [crns, setCRNS] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Fetch CRNs from the user's schedule
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && username) {
      axios.get(`/api/user/schedule/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setCRNS(response.data.schedule);
        })
        .catch(error => console.error('Error fetching schedule:', error));
    }
  }, [username]);

  // Fetch schedule details based on CRNs
  useEffect(() => {
    if (crns.length > 0) {
      axios.get('/api/newInstance')
        .then(response => {
          const filteredNewInstances = response.data.filter(newInstance => crns.includes(newInstance.crn));
          setSchedule(filteredNewInstances);
        })
        .catch(error => console.error('Error fetching newInstances:', error));
    }
  }, [crns]);

  // Handle search input changes
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
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort the schedule based on the selected column and direction
  const sortedSchedule = React.useMemo(() => {
    let sortableItems = [...schedule];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if ((a[sortConfig.key] || '').toLowerCase() < (b[sortConfig.key] || '').toLowerCase()) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if ((a[sortConfig.key] || '').toLowerCase() > (b[sortConfig.key] || '').toLowerCase()) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [schedule, sortConfig]);

  // Filter the schedule based on the search term
  const filteredAndSortedSchedule = sortedSchedule.filter(item =>
    (item.crn && item.crn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.course_id && item.course_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.instructor_id && item.instructor_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle removing a course from the schedule
  const handleRemoveFromSchedule = async (crn) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); // Retrieve username from localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await axios.post('/api/user/removeFromSchedule', {
        username,
        newInstanceId: crn
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setSchedule(schedule.filter(item => item.crn !== crn));
        alert('Course removed successfully.');
      }
    } catch (error) {
      console.error('Error removing from schedule:', error);
    }
  };


  return (
    <div>
      <h2>{username}'s Schedule</h2>
      <input
        type="text"
        placeholder="CRN / Instructor / Course..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th onClick={() => requestSort('crn')}>CRN{getSortDirectionIndicator('crn')}</th>
            <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
            <th onClick={() => requestSort('course_id')}>Course ID{getSortDirectionIndicator('course_id')}</th>
            <th onClick={() => requestSort('instructor_id')}>Instructor ID{getSortDirectionIndicator('instructor_id')}</th>
            <th onClick={() => requestSort('modality')}>Modality{getSortDirectionIndicator('modality')}</th>
            <th onClick={() => requestSort('credits')}>Credits{getSortDirectionIndicator('credits')}</th>
            <th onClick={() => requestSort('capacity')}>Capacity{getSortDirectionIndicator('capacity')}</th>
            <th onClick={() => requestSort('days')}>Days{getSortDirectionIndicator('days')}</th>
            <th onClick={() => requestSort('start_time')}>Start Time{getSortDirectionIndicator('start_time')}</th>
            <th onClick={() => requestSort('end_time')}>End Time{getSortDirectionIndicator('end_time')}</th>
            <th onClick={() => requestSort('location')}>Location{getSortDirectionIndicator('location')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedSchedule.map(schedule => (
            <tr key={schedule.crn}>
              <td>
                <button onClick={() => handleRemoveFromSchedule(schedule.crn)}>-</button>
              </td>
              <td>{schedule.crn}</td>
              <td>{schedule.title}</td>
              <td>
                <Link to={`/course/${schedule.course_id}`}>{schedule.course_id}</Link>
              </td>
              <td>
                <Link to={`/instructor/${schedule.instructor_id}`}>{schedule.instructor_id}</Link>
              </td>
              <td>{schedule.modality}</td>
              <td>{schedule.credits}</td>
              <td>{schedule.capacity}</td>
              <td>{schedule.days}</td>
              <td>{schedule.start_time}</td>
              <td>{schedule.end_time}</td>
              <td>{schedule.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;
