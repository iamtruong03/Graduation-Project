import React, { useState } from 'react';

function EmployeeDetails() {
    const [employee, setEmployee] = useState({
        name: '',
        position: '',
        department: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to add employee details
        console.log('Employee added:', employee);
    };

    return (
        <div>
            <h2>Add Employee Details</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={employee.name} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Position:
                    <input type="text" name="position" value={employee.position} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Department:
                    <input type="text" name="department" value={employee.department} onChange={handleChange} />
                </label>
                <br />
                <button type="submit">Add Employee</button>
            </form>
        </div>
    );
}

export default EmployeeDetails;