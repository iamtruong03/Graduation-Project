import './styles/dashboard.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DepartmentStats from './components/DepartmentStats';
import EmployeeStats from './components/EmployeeStats';
import ProjectStats from './components/ProjectStats';
import RiskList from './components/RiskList';
import DepartmentList from './components/DepartmentList';
import ProjectList from './components/ProjectList';
import ProjectCreate from './components/ProjectCreate';
import ProjectDetail from './components/ProjectDetail';
import ProjectEdit from './components/ProjectEdit';
import DepartmentStaffList from './components/DepartmentStaffList';
import StaffManagement from './components/StaffManagement';
import TaskList from './components/TaskList';
import TaskCreate from './components/TaskCreate';
import TaskDetail from './components/TaskDetail';
import TaskEdit from './components/TaskEdit';
import TaskTypeList from './components/TaskTypeList';
import DepartmentTypeList from './components/DepartmentTypeList';
import StaffCreate from './components/StaffCreate';
import StaffDetail from './components/StaffDetail';
import Login from './components/Login';
import Home from './components/Home';
import AccountList from './components/AccountList';
import MyAccount from './components/MyAccount';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/dashboard/department" element={<DepartmentStats />} />
          <Route path="/dashboard/employee" element={<EmployeeStats />} />
          <Route path="/dashboard/project" element={<ProjectStats />} />
          <Route path="/risk/list" element={<RiskList />} />
          <Route path="/department/list" element={<DepartmentList />} />
          <Route path="/project/list" element={<ProjectList />} />
          <Route path="/project/create" element={<ProjectCreate />} />
          <Route path="/project/detail/:id" element={<ProjectDetail />} />
          <Route path="/project/edit/:id" element={<ProjectEdit />} />
          <Route path="/staff/department" element={<DepartmentStaffList />} />
          <Route path="/staff/management" element={<StaffManagement />} />
          <Route path="/task/list" element={<TaskList />} />
          <Route path="/task/create" element={<TaskCreate />} />
          <Route path="/task/detail/:id" element={<TaskDetail />} />
          <Route path="/task/edit/:id" element={<TaskEdit />} />
          <Route path="/task/type" element={<TaskTypeList />} />
          <Route path="/department/type" element={<DepartmentTypeList />} />
          <Route path="/staff/create" element={<StaffCreate />} />
          <Route path="/staff/detail/:id" element={<StaffDetail />} />
          <Route path="/account/list" element={<AccountList />} />
          <Route path="/account/my-account" element={<MyAccount />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;