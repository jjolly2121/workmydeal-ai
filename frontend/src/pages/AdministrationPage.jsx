import { useEffect, useState } from "react";

import { apiFetch } from "../api";

function UserManagement() {
  // Administration state controls user records and the optional create form.
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserCount, setShowUserCount] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "REP",
    managerId: "",
    activeStatus: true,
  });

  const managers = users.filter((user) => user.role === "MANAGER");

  // User data feeds both the table and manager assignment dropdown.
  function loadUsers() {
    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }

  function loadAuditHistory() {
    apiFetch("/api/audit-history")
      .then((response) => response.json())
      .then((data) => setAuditHistory(data));
  }

  useEffect(() => {
    loadUsers();
    loadAuditHistory();
  }, []);

  // Shared form handler keeps the create-user form controlled.
  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  // New users are assigned their role and optional manager in one request.
  function createUser(event) {
    event.preventDefault();

    const payload = {
      ...formData,
      managerId: formData.managerId ? Number(formData.managerId) : null,
    };

    apiFetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("User created and permissions assigned.");
        setShowCreateUser(false);

        setFormData({
          name: "",
          email: "",
          password: "",
          role: "REP",
          managerId: "",
          activeStatus: true,
        });

        loadUsers();
        loadAuditHistory();
      });
  }

  // Role and active-status changes update the selected user record in place.
  function updateUserRole(user, role) {
    const updatedUser = {
      ...user,
      role,
    };

    apiFetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("User role updated.");
        loadUsers();
        loadAuditHistory();
      });
  }

  function toggleUserStatus(user) {
    const updatedUser = {
      ...user,
      activeStatus: !user.activeStatus,
    };

    apiFetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("User status updated.");
        loadUsers();
        loadAuditHistory();
      });
  }

  // Password reset stays manual so admins can choose a temporary password.
  function resetUserPassword(user) {
    const newPassword = window.prompt(`Enter a new password for ${user.name}:`);

    if (!newPassword || !newPassword.trim()) {
      return;
    }

    apiFetch(`/api/users/${user.id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("User password reset.");
        loadAuditHistory();
      });
  }

  // Deletion is reserved for test/demo users and asks for confirmation first.
  function deleteUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This should only be used for test users.`
    );

    if (!confirmed) {
      return;
    }

    apiFetch(`/api/users/${user.id}`, {
      method: "DELETE",
    }).then(() => {
      setFeedback("User deleted.");
      loadUsers();
      loadAuditHistory();
    });
  }

  return (
    <section className="user-management-page">
      <div className="section-header">
        <div>
          <h2>Users</h2>
        </div>

        <div className="admin-header-actions">
          <button
            className="link-button"
            type="button"
            onClick={() => setShowUserCount(!showUserCount)}
          >
            User Count
          </button>

          <button
            className="link-button"
            type="button"
            onClick={() => setShowAuditHistory(!showAuditHistory)}
          >
            Audit History
          </button>

          <button
            className="work-button"
            type="button"
            onClick={() => setShowCreateUser(!showCreateUser)}
          >
            {showCreateUser ? "Close" : "+ Add User"}
          </button>
        </div>
      </div>

      {feedback && <div className="save-feedback">{feedback}</div>}

      {/* Counts give administrators a quick role breakdown without leaving the page. */}
      {showUserCount && (
        <div className="admin-user-summary">
          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>

          <div>
            <span>Sales Reps</span>
            <strong>
              {users.filter((user) => user.role === "REP").length}
            </strong>
          </div>

          <div>
            <span>Managers</span>
            <strong>
              {users.filter((user) => user.role === "MANAGER").length}
            </strong>
          </div>

          <div>
            <span>Administrators</span>
            <strong>
              {users.filter((user) => user.role === "ADMIN").length}
            </strong>
          </div>
        </div>
      )}

      {/* Audit history gives administrators visibility into sensitive changes. */}
      {showAuditHistory && (
        <div className="history-section">
          <h3>Audit History</h3>

          {auditHistory.length === 0 ? (
            <p className="empty-history">No audit history recorded yet.</p>
          ) : (
            <div className="history-list">
              {auditHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <strong>{item.actionType}</strong>
                  <span>
                    {item.entityType} #{item.entityId || "N/A"}
                  </span>
                  <p>
                    {item.details || "No details."} Performed by{" "}
                    {item.performedBy || "Unknown"} on{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Unknown date"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create form is hidden by default to keep daily admin review compact. */}
      {showCreateUser && (
        <form
          className="add-opportunity-form admin-create-user-form"
          onSubmit={createUser}
        >
          <h3>Create User</h3>

          <div className="form-grid">
            <label>
              Name
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Role
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="REP">Sales Representative</option>
                <option value="MANAGER">Sales Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </label>

            {formData.role === "REP" && (
              <label>
                Manager
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleInputChange}
                >
                  <option value="">No Manager Assigned</option>

                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <button className="work-button" type="submit">
            Create User
          </button>
        </form>
      )}

      <div className="user-table">
        <div className="user-row user-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {users.map((user) => (
          <div key={user.id} className="user-row">
            <span>{user.name}</span>
            <span>{user.email}</span>

            <span>
              <select
                className="inline-select"
                value={user.role}
                onChange={(event) => updateUserRole(user, event.target.value)}
              >
                <option value="REP">Sales Representative</option>
                <option value="MANAGER">Sales Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </span>

            <span>{user.activeStatus ? "Active" : "Inactive"}</span>

            <span className="user-actions">
              <button
                className="refresh-button"
                onClick={() => toggleUserStatus(user)}
              >
                {user.activeStatus ? "Deactivate" : "Reactivate"}
              </button>

              <button
                className="refresh-button"
                onClick={() => resetUserPassword(user)}
              >
                Reset Password
              </button>

              <button
                className="cancel-button icon-button trash-button"
                aria-label={`Delete ${user.name}`}
                title="Delete"
                onClick={() => deleteUser(user)}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z" />
                  <path d="M8 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z" />
                  <path d="M10.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                </svg>
              </button>
            </span>
          </div>
        ))}
      </div>

      <p className="admin-role-note">Roles: Sales Rep, Manager, Admin</p>
    </section>
  );
}

export default UserManagement;
