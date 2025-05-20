import './styles/dashboard.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import DepartmentStats from './components/dashboard/DepartmentStats';
import RiskList from './components/risk/RiskList';
import RiskCreate from './components/risk/RiskCreate';
import RiskDetail from './components/risk/RiskDetail';
import DepartmentList from './components/department/DepartmentList';
import ProjectList from './components/project/ProjectList';
import ProjectCreate from './components/project/ProjectCreate';
import ProjectDetail from './components/project/ProjectDetail';
import StaffManagement from './components/user/StaffManagement';
import TaskList from './components/task/TaskList';
import TaskCreate from './components/task/TaskCreate';
import TaskDetail from './components/task/TaskDetail';
import CategoryManagement from './components/category/CategoryManagement';
import CategoryTypeManagement from './components/category/CategoryTypeManagement';
import StaffCreate from './components/user/StaffCreate';
import StaffDetail from './components/user/StaffDetail';
import StaffEdit from './components/user/StaffEdit';
import Login from './components/Login';
import Home from './components/Home';
import MyAccount from './components/user/MyAccount';
import NotificationCenter from './components/NotificationCenter';
import DocumentManagement from './components/DocumentManagement';
import Chat from './components/chat/Chat';
import EmployeePerformanceStats from './components/dashboard/EmployeePerformanceStats';

function App() {
  return (
    <Router {...routerConfig}>
      <Routes>
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="/dashboard/department" element={<DepartmentStats />} />
          <Route path="/dashboard/employee" element={<EmployeePerformanceStats />} />
          <Route path="/risk/list" element={<RiskList />} />
          <Route path="/risk/create" element={<RiskCreate />} />
          <Route path="/risk/detail/:id" element={<RiskDetail />} />
          <Route path="/department/list" element={<DepartmentList />} />
          <Route path="/project/list" element={<ProjectList />} />
          <Route path="/project/create" element={<ProjectCreate />} />
          <Route path="/project/detail/:id" element={<ProjectDetail />} />
          <Route path="/staff/management" element={<StaffManagement />} />
          <Route path="/task/list" element={<TaskList />} />
          <Route path="/task/create" element={<TaskCreate />} />
          <Route path="/task/detail/:id" element={<TaskDetail />} />
          <Route path="/category/management" element={<CategoryManagement />} />
          <Route path="/category/type" element={<CategoryTypeManagement />} />
          <Route path="/staff/create" element={<StaffCreate />} />
          <Route path="/staff/detail/:id" element={<StaffDetail />} />
          <Route path="/staff/edit/:id" element={<StaffEdit />} />
          <Route path="/account/my-account" element={<MyAccount />} />
          <Route path="/notification" element={<NotificationCenter />} />
          <Route path="/document/management" element={<DocumentManagement />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;