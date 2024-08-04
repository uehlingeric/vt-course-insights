import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './List.css'; 

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Fetch all departments on component mount
    useEffect(() => {
        axios.get('/api/dept')
            .then(response => {
                setDepartments(response.data);
            })
            .catch(error => console.error('Error fetching departments:', error));
    }, []);

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

    const getGPATextColor = (gpa) => {
        if (gpa > 3) {
            return 'green';
        } else if (gpa < 3) {
            return 'red';
        } else {
            return 'black';
        }
    };

    // Sort and filter the departments based on user input and selected sort configuration
    const sortedAndFilteredDepartments = React.useMemo(() => {
        let sortableItems = [...departments];
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
        return sortableItems.filter(dept =>
            dept.dept_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [departments, searchTerm, sortConfig]);

    return (
        <div>
            <h2>Departments</h2>
            <input
                type="text"
                placeholder="Search by ID or Title..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <table>
                <thead>
                    <tr>
                        <th onClick={() => requestSort('dept_id')}>ID{getSortDirectionIndicator('dept_id')}</th>
                        <th onClick={() => requestSort('title')}>Title{getSortDirectionIndicator('title')}</th>
                        <th onClick={() => requestSort('gpa')}>GPA{getSortDirectionIndicator('gpa')}</th>
                        <th onClick={() => requestSort('past_classes')}>Past Classes{getSortDirectionIndicator('past_classes')}</th>
                        <th onClick={() => requestSort('unique_classes')}>Unique Classes{getSortDirectionIndicator('unique_classes')}</th>
                        <th onClick={() => requestSort('new_classes')}>New Classes{getSortDirectionIndicator('new_classes')}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredDepartments.map(dept => (
                        <tr key={dept.dept_id}>
                            <td>
                                <Link to={`/department/${dept.dept_id}`} className="dept-link">
                                    {dept.dept_id}
                                </Link>
                            </td>
                            <td>{dept.title}</td>
                            <td style={{ color: getGPATextColor(dept.gpa) }}>{dept.gpa.toFixed(2)}</td>
                            <td>{dept.past_classes}</td>
                            <td>{dept.unique_classes}</td>
                            <td>{dept.new_classes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DepartmentList;
