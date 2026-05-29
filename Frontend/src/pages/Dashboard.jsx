import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css'; // Separate professional CSS file import

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', date: '' });
  const [error, setError] = useState('');

  // Environment Variable fallback setup (Vite defaults syntax)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses`, config);
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to fetch data from database');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/expenses`, formData, config);
      setFormData({ title: '', amount: '', category: 'Food', date: '' });
      setError('');
      fetchExpenses();
    } catch (err) {
      setError('Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`, config);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  // --- ANALYTICS CODE START ---
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  // 1. Calculate Monthly Average
  const uniqueMonths = [...new Set(expenses.map(item => {
    const d = new Date(item.date);
    return `${d.getFullYear()}-${d.getMonth()}`; // Tracks unique Year-Month combinations
  }))];
  const avgPerMonth = uniqueMonths.length > 0 ? Math.round(totalExpense / uniqueMonths.length) : 0;

  // 2. Calculate Weekly Average
  const uniqueWeeks = [...new Set(expenses.map(item => {
    const d = new Date(item.date);
    // Logic to calculate week number of the year
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - startOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNum}`; // Tracks unique Year-Week combinations
  }))];
  const avgPerWeek = uniqueWeeks.length > 0 ? Math.round(totalExpense / uniqueWeeks.length) : 0;
  // --- ANALYTICS CODE END ---

  return (
    <div className="dashboard-container">
      {/* Header Panel */}
      <div className="dashboard-header">
        <h2 className="welcome-text">Welcome, {user?.name}! 👋</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Grid Layout Matrix */}
      <div className="grid-layout">
        
        {/* Left Column: Form Container */}
        <div className="form-card">
          <h3 className="section-title">Add New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title:</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                className="form-input" 
                placeholder="e.g., Internet Bill"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (INR):</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                className="form-input" 
                placeholder="₹ Enter Amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category:</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date:</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="form-input" 
                required
              />
            </div>
            <button type="submit" className="submit-btn">Add Expense</button>
          </form>
        </div>

        {/* Right Column: Metrics & History */}
        <div className="history-section">
          
          {/* 3 Premium Responsive Analytics Cards Grid */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
            
            {/* Box 1: Total Spent */}
            <div className="metrics-card" style={{ flex: '1', minWidth: '180px', margin: 0 }}>
              <h4 className="metrics-label">Total Budget Spent</h4>
              <h2 className="metrics-value">₹{totalExpense}</h2>
            </div>

            {/* Box 2: Weekly Average */}
            <div className="metrics-card" style={{ flex: '1', minWidth: '180px', margin: 0, borderLeft: '5px solid #3b82f6' }}>
              <h4 className="metrics-label">Weekly Average</h4>
              <h2 className="metrics-value" style={{ color: '#3b82f6' }}>₹{avgPerWeek}</h2>
            </div>

            {/* Box 3: Monthly Average */}
            <div className="metrics-card" style={{ flex: '1', minWidth: '180px', margin: 0, borderLeft: '5px solid #f59e0b' }}>
              <h4 className="metrics-label">Monthly Average</h4>
              <h2 className="metrics-value" style={{ color: '#f59e0b' }}>₹{avgPerMonth}</h2>
            </div>

          </div>

          <h3 className="section-title">Transaction History</h3>
          
          <div className="table-responsive">
            {expenses.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No transactions added yet.</p>
            ) : (
              <table className="expense-table">
                <thead>
                  <tr className="table-head-row">
                    <th className="table-th">Title</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((item) => (
                    <tr key={item._id} className="table-row">
                      <td className="table-td">{item.title}</td>
                      <td className="table-td">
                        <span className="category-badge">{item.category}</span>
                      </td>
                      <td className="table-td-amount">₹{item.amount}</td>
                      <td className="table-td">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="table-td">
                        <button onClick={() => handleDelete(item._id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;