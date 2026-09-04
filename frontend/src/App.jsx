import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Database,
  CloudLightning,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch users & check server health
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Healthcheck
      const healthRes = await fetch(`${API_BASE_URL}/health`);
      if (healthRes.ok) {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }

      // 2. Fetch users
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || `Database error (Status: ${res.status})`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMessage(err.message || `Cannot connect to Backend API at ${API_BASE_URL}. Ensure the backend server and PostgreSQL database are running.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.id && user.id.toString().includes(term))
    );
  }, [users, searchTerm]);

  // Handle Add User Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please provide both name and email', 'error');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to add user');
      }

      showToast('User created successfully!', 'success');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '' });
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email });
    setIsEditModalOpen(true);
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please provide both name and email', 'error');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update user');
      }

      showToast(`User #${selectedUser.id} updated!`, 'success');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete User Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete user');
      }

      showToast(`User #${selectedUser.id} deleted.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <Users size={26} />
          </div>
          <div className="logo-text">
            <h1>User Directory</h1>
            <p>Fullstack React · Node.js · Express · PostgreSQL</p>
          </div>
        </div>

        <div className="header-badges">
          <span className="badge badge-react">
            <Sparkles size={13} /> React + Vite
          </span>
          <span className="badge badge-node">
            <Server size={13} /> Node Express API
          </span>
          <span className="badge badge-postgres">
            <Database size={13} /> PostgreSQL
          </span>
        </div>
      </header>

      {/* Error Banner if connection fails */}
      {errorMessage && (
        <div className="alert-banner">
          <div className="alert-content">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
          <button className="btn btn-secondary" onClick={fetchData} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-users">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-status">
            {apiOnline ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: apiOnline ? 'var(--success)' : 'var(--danger)' }}>
              {apiOnline ? 'Online' : 'Disconnected'}
            </span>
            <span className="stat-label">API Status ({API_BASE_URL})</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-aws">
            <CloudLightning size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">Ready</span>
            <span className="stat-label">AWS Cloud Deploy</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Search & Add) */}
      <div className="action-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({ name: '', email: '' });
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="state-container">
          <RefreshCw size={32} className="spinning" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="state-desc">Loading users from PostgreSQL...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="state-container">
          <div className="state-icon">
            <Users size={28} />
          </div>
          <h2 className="state-title">{searchTerm ? 'No matching users found' : 'No users in database yet'}</h2>
          <p className="state-desc">
            {searchTerm 
              ? `No user records matched "${searchTerm}". Try a different search term.` 
              : 'Add your first user using the button above to populate PostgreSQL database.'}
          </p>
          {!searchTerm && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setFormData({ name: '', email: '' });
                setIsAddModalOpen(true);
              }}
            >
              <UserPlus size={18} /> Create First User
            </button>
          )}
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>
                <div className="user-info">
                  <h3 className="user-name" title={user.name}>{user.name}</h3>
                  <p className="user-email" title={user.email}>
                    <Mail size={13} /> {user.email}
                  </p>
                </div>
              </div>

              <div className="user-footer">
                <span className="user-id-badge">ID #{user.id}</span>
                <div className="user-actions">
                  <button 
                    className="btn-icon-only" 
                    title="Edit user"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="btn-icon-only btn-icon-danger" 
                    title="Delete user"
                    onClick={() => openDeleteModal(user)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="btn-icon-only" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="add-name">Full Name</label>
                  <input
                    id="add-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-email">Email Address</label>
                  <input
                    id="add-email"
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  disabled={formSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User #{selectedUser?.id}</h3>
              <button className="btn-icon-only" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  disabled={formSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="btn-icon-only" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete user <strong style={{ color: 'var(--text-primary)' }}>{selectedUser?.name}</strong> ({selectedUser?.email})? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                disabled={formSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                disabled={formSubmitting}
                onClick={handleDeleteConfirm}
              >
                {formSubmitting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
