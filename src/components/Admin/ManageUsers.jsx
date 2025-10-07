// ManageUsers.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { db } from "../../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export function ManageUsers() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to deactivate ${userEmail}? This will prevent them from logging in.`)) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        status: "deactivated",
        deactivatedAt: new Date(),
        deactivatedBy: currentUser?.email
      });
      alert(`${userEmail} has been deactivated successfully.`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("Error deactivating user. Please try again.");
    }
  };

  const reactivateUser = async (userId, userEmail) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        status: "active",
        reactivatedAt: new Date(),
        reactivatedBy: currentUser?.email
      });
      alert(`${userEmail} has been reactivated successfully.`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error reactivating user:", error);
      alert("Error reactivating user. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styling matching Records & Analytics component
  const containerStyle = {
    fontFamily: "'Inter', sans-serif",
    background: "#f0f4f8",
    minHeight: "100vh",
    padding: window.innerWidth <= 576 ? "10px" : "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const cardStyle = {
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    padding: window.innerWidth <= 576 ? "15px" : "20px",
    marginBottom: "20px",
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
  };

  const headerStyle = {
    display: "flex",
    flexDirection: window.innerWidth <= 576 ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "10px",
  };

  const titleStyle = {
    fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem",
    margin: 0,
    color: "#2c3e50",
    fontWeight: "600",
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: "1rem",
    color: "#6c757d",
    fontWeight: "400",
  };

  const searchInputStyle = {
    padding: window.innerWidth <= 576 ? "8px 12px" : "10px 15px",
    borderRadius: "25px",
    border: "2px solid #e9ecef",
    fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem",
    width: window.innerWidth <= 576 ? "100%" : "300px",
    outline: "none",
    transition: "border-color 0.3s ease",
    background: "#f8f9fa",
  };

  const buttonStyle = {
    padding: window.innerWidth <= 576 ? "8px 16px" : "10px 20px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    cursor: "pointer",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(74, 144, 226, 0.3)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "20px",
  };

  const tableWrapperStyle = {
    overflowX: window.innerWidth <= 576 ? "auto" : "visible",
    width: "100%",
  };

  const thStyle = {
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    padding: window.innerWidth <= 576 ? "8px" : "12px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "1rem",
    fontWeight: "600",
    borderBottom: "1px solid #dee2e6",
  };

  const tdStyle = {
    padding: window.innerWidth <= 576 ? "8px" : "12px",
    borderBottom: "1px solid #dee2e6",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem",
  };

  const loadingStyle = {
    textAlign: "center",
    padding: "50px",
    fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem",
    color: "#6c757d",
  };

  const loadingSpinnerStyle = {
    display: "inline-block",
    width: "3rem",
    height: "3rem",
    border: "5px solid #4a90e2",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6c757d",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "2px dashed #dee2e6",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "50px" }}>
        <div style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", color: "#6c757d" }}>
          <div style={loadingSpinnerStyle}></div>
          <p style={{ marginTop: "10px" }}>Loading users...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>👥 User Management</h1>
          <p style={subtitleStyle}>Manage and deactivate user accounts</p>
        </div>

        {/* Stats Cards - Matching Records & Analytics style */}
        <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", gap: "15px", justifyContent: "center", marginBottom: "20px", width: "100%", flexWrap: "wrap" }}>
          <div style={{ background: "linear-gradient(135deg, #4a90e2, #34c759)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Total Users</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{users.length}</div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              All registered users
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #17a2b8, #20c997)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Active Users</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
              {users.filter(u => u.status !== 'deactivated').length}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Currently active
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #ffc107, #fd7e14)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Patients</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
              {users.filter(u => u.role === 'patient').length}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Patient accounts
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #6f42c1, #e83e8c)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Dentists</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
              {users.filter(u => u.role === 'dentist').length}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Dental professionals
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #28a745, #20c997)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Admins</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Administrators
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #dc3545, #e83e8c)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Deactivated</h4>
            <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
              {users.filter(u => u.status === 'deactivated').length}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
              Inactive accounts
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", justifyContent: "center", alignItems: "center", marginBottom: "20px", gap: "15px" }}>
          <input
            type="text"
            placeholder="Search users by email, name, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          <button 
            style={buttonStyle}
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Users"}
          </button>
        </div>

        {/* Users Table */}
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ 
                  background: user.id === currentUser?.uid ? '#fff3cd' : 'transparent',
                  borderLeft: user.id === currentUser?.uid ? '4px solid #ffc107' : 'none'
                }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <span style={{ fontWeight: "500", wordBreak: "break-word" }}>{user.email}</span>
                      {user.id === currentUser?.uid && (
                        <small style={{ 
                          color: "#856404", 
                          background: "#fff3cd", 
                          padding: "2px 8px", 
                          borderRadius: "12px", 
                          fontSize: "0.7rem",
                          marginTop: "4px"
                        }}>
                          Current User
                        </small>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: "500" }}>{user.name || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "white",
                      background: user.role === 'admin' 
                        ? "linear-gradient(135deg, #dc3545, #e83e8c)" 
                        : user.role === 'dentist' 
                        ? "linear-gradient(135deg, #17a2b8, #20c997)"
                        : "linear-gradient(135deg, #4a90e2, #34c759)"
                    }}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "white",
                      background: user.status === 'deactivated' 
                        ? "linear-gradient(135deg, #6c757d, #495057)" 
                        : "linear-gradient(135deg, #28a745, #20c997)"
                    }}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      {user.status === 'deactivated' ? (
                        <button
                          style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "none",
                            background: "linear-gradient(135deg, #28a745, #20c997)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            minWidth: "120px",
                            transition: "all 0.3s ease"
                          }}
                          onClick={() => reactivateUser(user.id, user.email)}
                          title="Reactivate User"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "none",
                            background: user.id === currentUser?.uid 
                              ? "linear-gradient(135deg, #6c757d, #495057)" 
                              : "linear-gradient(135deg, #dc3545, #e83e8c)",
                            color: "white",
                            cursor: user.id === currentUser?.uid ? "not-allowed" : "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            minWidth: "120px",
                            opacity: user.id === currentUser?.uid ? 0.6 : 1,
                            transition: "all 0.3s ease"
                          }}
                          onClick={() => user.id !== currentUser?.uid && deactivateUser(user.id, user.email)}
                          title={user.id === currentUser?.uid ? "Cannot deactivate your own account" : "Deactivate User"}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: "0.6" }}>🔍</div>
              <h4 style={{ margin: "0 0 8px 0", color: "#6c757d" }}>No users found</h4>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                {searchTerm ? 'Try adjusting your search terms' : 'No users in the system'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}