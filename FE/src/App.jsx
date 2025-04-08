import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DepartmentList from './components/DepartmentList';
import RiskList from './components/RiskList';
import ProjectList from './components/ProjectList';
import DepartmentStaffList from './components/DepartmentStaffList';
import StaffManagement from './components/StaffManagement';
import TaskList from './components/TaskList';
import TaskTypeList from './components/TaskTypeList';
import TaskStatusList from './components/TaskStatusList';
import DepartmentTypeList from './components/DepartmentTypeList';
import TaskCreate from './components/TaskCreate';
import TaskDetail from './components/TaskDetail';
import ProjectCreate from './components/ProjectCreate';
import ProjectDetail from './components/ProjectDetail';
import StaffCreate from './components/StaffCreate';
import StaffDetail from './components/StaffDetail';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/risk/list" replace />} />
          <Route path="/risk/list" element={<RiskList />} />
          <Route path="/department/list" element={<DepartmentList />} />
          <Route path="/project/list" element={<ProjectList />} />
          <Route path="/project/create" element={<ProjectCreate />} />
          <Route path="/project/detail/:id" element={<ProjectDetail />} />
          <Route path="/staff/department" element={<DepartmentStaffList />} />
          <Route path="/staff/management" element={<StaffManagement />} />
          <Route path="/task/list" element={<TaskList />} />
          <Route path="/task/create" element={<TaskCreate />} />
          <Route path="/task/detail/:id" element={<TaskDetail />} />
          <Route path="/task/type" element={<TaskTypeList />} />
          <Route path="/task/status" element={<TaskStatusList />} />
          <Route path="/department/type" element={<DepartmentTypeList />} />
          <Route path="/staff/create" element={<StaffCreate />} />
          <Route path="/staff/detail/:id" element={<StaffDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;