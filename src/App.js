import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CafeOwnerDashboard from './pages/CafeOwnerDashboard';
import CustomerMenu from './pages/CustomerMenu';
import CustomerOrders from './pages/CustomerOrders';
import ChefDashboard from './pages/ChefDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import ForgotPassword from './pages/ForgotPassword';
import AdminUserList from './pages/AdminUserList';
import AdminCafeList from './pages/AdminCafeList';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminComplaints from './pages/AdminComplaints';
import LiveOrders from './pages/LiveOrders';
import MenuManager from './pages/MenuManager';
import StaffManager from './pages/StaffManager';
import CafeExplorer from './pages/CafeExplorer';
import Profile from './pages/Profile';
import Vouchers from './pages/Vouchers';
import CustomerBookings from './pages/CustomerBookings';
import CafeBookings from './pages/CafeBookings';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/cafe/dashboard" element={<CafeOwnerDashboard />} />
          <Route path="/cafe/orders" element={<LiveOrders />} />
          <Route path="/cafe/menu" element={<MenuManager />} />
          <Route path="/cafe/staff" element={<StaffManager />} />
          <Route path="/admin/orders" element={<LiveOrders />} />
          <Route path="/admin/menu" element={<MenuManager />} />
          <Route path="/admin/staff" element={<StaffManager />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/admin/cafes" element={<AdminCafeList />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/explore" element={<CafeExplorer />} />
          <Route path="/customer/menu/:cafeId" element={<CustomerMenu />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/vouchers" element={<Vouchers />} />
          <Route path="/customer/bookings" element={<CustomerBookings />} />
          <Route path="/cafe/bookings" element={<CafeBookings />} />
          <Route path="/cafe/history" element={<OrderHistory />} />
          <Route path="/chef/dashboard" element={<ChefDashboard />} />
          <Route path="/waiter/dashboard" element={<WaiterDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
