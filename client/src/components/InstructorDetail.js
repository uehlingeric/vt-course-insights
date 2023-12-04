import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './List.css';


const InstructorDetail = () => {
    const [activeTab, setActiveTab] = useState('newInstances');
    const [instructor, setInstructor] = useState([]);
    const [courses, setCourses] = useState([]);
    const [newInstances, setNewInstances] = useState([]);
    const [instructorCourseStats, setInstructorCourseStats] = useState([]);
    const [pastInstances, setPastInstances] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const { instructorId } = useParams(); // Get instructor ID from URL

    useEffect(() => {
        // Fetch instructor details
        axios.get(`/api/instructor`)
            .then(response => {
                const filteredDept = response.data.filter(instructor => instructor.instructor_id === instructorId);
                if (filteredDept.length > 0) {
                    setInstructor(filteredDept[0]); // Set the first element of the filtered array
                }
            })
            .catch(error => console.error('Error fetching instructor details:', error));

        // Fetch newInstances
        axios.get('/api/newInstance')
            .then(response => {
                const filteredNewInstances = response.data.filter(newInstance => newInstance.instructor_id === instructorId);
                setNewInstances(filteredNewInstances);
            })
            .catch(error => console.error('Error fetching newInstances:', error));

        // Fetch instructorCourseStats
        axios.get('/api/instructorCourseStat')
            .then(response => {
                const filteredInstructorCourseStats = response.data.filter(instructorCourseStat => instructorCourseStat.instructor_id === instructorId);
                setInstructorCourseStats(filteredInstructorCourseStats);
            })
            .catch(error => console.error('Error fetching instructorCourseStats:', error));

        // Fetch pastInstances
        axios.get('/api/pastInstance')
            .then(response => {
                const filteredPastInstances = response.data.filter(pastInstance => pastInstance.instructor_id === instructorId);
                setPastInstances(filteredPastInstances);
            })
            .catch(error => console.error('Error fetching pastInstances:', error));

        // Fetch courses and create a mapping
        axios.get('/api/course')
            .then(response => {
                const courseMapping = response.data.reduce((acc, course) => {
                    acc[course.course_id] = course.title; // Create a mapping of course_id to title
                    return acc;
                }, {});
                setCourses(courseMapping);
            })
            .catch(error => console.error('Error fetching courses:', error));
    }, [instructorId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const getSortDirectionIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return ' ↕'; // Neutral icon
    };

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

    const getCourseTitle = useCallback((courseId) => {
        return courses[courseId] || courseId; // Return the course title or the ID if not found
    }, [courses]);

    const calculateWithdrawRate = (withdraw, enrollment) => {
        if (enrollment === 0) return 0; // Avoid division by zero
        return (withdraw / enrollment) * 100; // Return a numeric value
    };

    const sortedNewInstances = React.useMemo(() => {
        let sortableItems = [...newInstances];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [newInstances, sortConfig]);

    const filteredAndSortedNewInstances = sortedNewInstances.filter(newInstances =>
        newInstances.crn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newInstances.course_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedInstructorCourseStats = React.useMemo(() => {
        let sortableItems = [...instructorCourseStats];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // If sorting by title, use the getCourseTitle function
                if (sortConfig.key === 'title') {
                    aValue = getCourseTitle(a.course_id);
                    bValue = getCourseTitle(b.course_id);
                }

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
    }, [instructorCourseStats, sortConfig, getCourseTitle]);

    const filteredAndSortedInstructorCourseStats = sortedInstructorCourseStats.filter(instructorCourseStats =>
        instructorCourseStats.course_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPastInstances = React.useMemo(() => {
        let sortableItems = [...pastInstances];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // If sorting by title, use the getCourseTitle function
                if (sortConfig.key === 'title') {
                    aValue = getCourseTitle(a.course_id);
                    bValue = getCourseTitle(b.course_id);
                }

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
    }, [pastInstances, sortConfig, getCourseTitle]);

    const filteredAndSortedPastInstances = sortedPastInstances.filter(pastInstances =>
        pastInstances.course_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNewInstance = (crn) => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username'); // Retrieve username from localStorage

        if (!token) {
            alert('You must be logged in to add courses');
            return;
        }

        axios.post('/api/user/addToSchedule', { username, crn }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                alert('Course added to your schedule successfully');
            })
            .catch(error => {
                console.error('Error adding course to schedule:', error);
                alert('Error adding course to schedule');
            });
    };

    return (
        <div>
            <h2>{instructor.last_name} - {instructor.dept}</h2>
            <button onClick={() => setActiveTab('newInstances')}>New Instances</button>
            <button onClick={() => setActiveTab('instructorCourseStats')}>Instructor Course Stats</button>
            <button onClick={() => setActiveTab('pastInstances')}>Past Instances</button>

            {activeTab === 'newInstances' && (
                <div>
                    <input
                        type="text"
                        placeholder="Search by CRN / Course..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <table>
                        <thead>
                            <tr>
                                {localStorage.getItem('token') && <th className="add-to-schedule-col">Action</th>}
                                <th onClick={() => requestSort('crn')}>CRN{getSortDirectionIndicator('crn')}</th>
                                <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
                                <th onClick={() => requestSort('course_id')}>Course ID{getSortDirectionIndicator('course_id')}</th>
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
                            {filteredAndSortedNewInstances.map(newInstance => (
                                <tr key={newInstance.crn}>
                                    {localStorage.getItem('token') && (
                                        <td className="add-to-schedule-col">
                                            <button onClick={() => handleAddNewInstance(newInstance.crn)}>+</button>
                                        </td>
                                    )}
                                    <td>{newInstance.crn}</td>
                                    <td>{newInstance.title}</td>
                                    <td>
                                        <Link to={`/course/${newInstance.course_id}`}>{newInstance.course_id}</Link>
                                    </td>
                                    <td>{newInstance.modality}</td>
                                    <td>{newInstance.credits}</td>
                                    <td>{newInstance.capacity}</td>
                                    <td>{newInstance.days}</td>
                                    <td>{newInstance.start_time}</td>
                                    <td>{newInstance.end_time}</td>
                                    <td>{newInstance.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'instructorCourseStats' && (
                <div>
                    <input
                        type="text"
                        placeholder="Search by Course..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('course_id')}>Course ID{getSortDirectionIndicator('course_id')}</th>
                                <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
                                <th onClick={() => requestSort('gpa')}>GPA{getSortDirectionIndicator('gpa')}</th>
                                <th onClick={() => requestSort('enrollment')}>Enrollment{getSortDirectionIndicator('enrollment')}</th>
                                <th onClick={() => requestSort('withdraw')}>Withdraw{getSortDirectionIndicator('withdraw')}</th>
                                <th onClick={() => requestSort('withdraw_rate')}>Withdraw Rate{getSortDirectionIndicator('withdraw_rate')}</th>
                                <th onClick={() => requestSort('past_classes')}>Past Classes{getSortDirectionIndicator('past_classes')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedInstructorCourseStats.map(instructorCourseStat => (
                                <tr key={instructorCourseStat.stat_id}>
                                    <td>
                                        <Link to={`/course/${instructorCourseStat.course_id}`}>{instructorCourseStat.course_id}</Link>
                                    </td>
                                    <td>{getCourseTitle(instructorCourseStat.course_id)}</td>
                                    <td>{instructorCourseStat.gpa.toFixed(2)}</td>
                                    <td>{instructorCourseStat.enrollment.toFixed(2)}</td>
                                    <td>{instructorCourseStat.withdraw.toFixed(2)}</td>
                                    <td>{calculateWithdrawRate(instructorCourseStat.withdraw, instructorCourseStat.enrollment).toFixed(2)}%</td>
                                    <td>{instructorCourseStat.past_classes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'pastInstances' && (
                <div>
                    <input
                        type="text"
                        placeholder="Search by Course..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('course_id')}>Course ID{getSortDirectionIndicator('course_id')}</th>
                                <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
                                <th onClick={() => requestSort('year')}>Year{getSortDirectionIndicator('year')}</th>
                                <th onClick={() => requestSort('term')}>Term{getSortDirectionIndicator('term')}</th>
                                <th onClick={() => requestSort('crn')}>CRN{getSortDirectionIndicator('crn')}</th>
                                <th onClick={() => requestSort('gpa')}>GPA{getSortDirectionIndicator('gpa')}</th>
                                <th onClick={() => requestSort('enrollment')}>Enrollment{getSortDirectionIndicator('enrollment')}</th>
                                <th onClick={() => requestSort('withdraw')}>Withdraw{getSortDirectionIndicator('withdraw')}</th>
                                <th onClick={() => requestSort('withdraw_rate')}>Withdraw Rate{getSortDirectionIndicator('withdraw_rate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedPastInstances.map(pastInstance => (
                                <tr key={pastInstance.instance_id}>
                                    <td>
                                        <Link to={`/course/${pastInstance.course_id}`}>{pastInstance.course_id}</Link>
                                    </td>
                                    <td>{getCourseTitle(pastInstance.course_id)}</td>
                                    <td>{pastInstance.year}</td>
                                    <td>{pastInstance.term}</td>
                                    <td>{pastInstance.crn}</td>
                                    <td>{pastInstance.gpa.toFixed(2)}</td>
                                    <td>{pastInstance.enrollment}</td>
                                    <td>{pastInstance.withdraw}</td>
                                    <td>{calculateWithdrawRate(pastInstance.withdraw, pastInstance.enrollment).toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

};

export default InstructorDetail;
