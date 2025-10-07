import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

const Enquiries = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New search and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "enquiries"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const enquiriesData = [];
      querySnapshot.forEach((doc) => {
        enquiriesData.push({ id: doc.id, ...doc.data() });
      });
      setEnquiries(enquiriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await updateDoc(doc(db, "enquiries", enquiryId), {
        status: newStatus,
        readAt: newStatus === "read" ? new Date() : null,
      });
    } catch (error) {
      console.error("Error updating enquiry status:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Enhanced filtering and sorting function
  const getFilteredAndSortedEnquiries = () => {
    let filtered = enquiries.filter(enquiry => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const name = enquiry.name?.toLowerCase() || "";
      const email = enquiry.email?.toLowerCase() || "";
      const subject = enquiry.subject?.toLowerCase() || "";
      const message = enquiry.message?.toLowerCase() || "";
      
      const matchesSearch = !searchTerm || 
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        subject.includes(searchLower) ||
        message.includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;

      // Date range filter
      if (enquiry.timestamp) {
        const enquiryDate = enquiry.timestamp.toDate ? enquiry.timestamp.toDate() : new Date(enquiry.timestamp);
        const matchesDateFrom = !dateFrom || enquiryDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || enquiryDate <= new Date(dateTo);
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "timestamp":
          aValue = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
          bValue = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
          break;
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "email":
          aValue = a.email?.toLowerCase() || "";
          bValue = b.email?.toLowerCase() || "";
          break;
        case "subject":
          aValue = a.subject?.toLowerCase() || "";
          bValue = b.subject?.toLowerCase() || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortField("timestamp");
    setSortDirection("desc");
  };

  const handleBackClick = () => {
    navigate("/admin-dashboard");
  };

  const filteredEnquiries = getFilteredAndSortedEnquiries();

  // Calculate statistics
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter(enquiry => enquiry.status === "new" || !enquiry.status).length;
  const readEnquiries = enquiries.filter(enquiry => enquiry.status === "read").length;
  const resolvedEnquiries = enquiries.filter(enquiry => enquiry.status === "resolved").length;

  // Inline styles for responsiveness
  const containerStyle = {
    fontFamily: "'Inter', sans-serif",
    background: "#f0f4f8",
    minHeight: "100vh",
    padding: window.innerWidth <= 576 ? "10px" : "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const searchContainerStyle = {
    background: "white",
    padding: window.innerWidth <= 576 ? "15px" : "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
  };

  const searchRowStyle = {
    display: "grid",
    gridTemplateColumns: window.innerWidth <= 576 ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "15px",
  };

  const inputStyle = {
    padding: window.innerWidth <= 576 ? "8px 12px" : "10px 14px",
    borderRadius: "8px",
    border: "2px solid #e1e5e9",
    fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem",
    transition: "border-color 0.3s ease",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: "white",
    cursor: "pointer",
  };

  const buttonStyle = {
    padding: window.innerWidth <= 576 ? "8px 16px" : "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
  };

  const tableStyle = {
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
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
    maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
  };

  const thStyle = {
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    padding: window.innerWidth <= 576 ? "12px 8px" : "15px 12px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "1rem",
    fontWeight: "600",
    borderBottom: "1px solid #dee2e6",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s ease",
  };

  const tdStyle = {
    padding: window.innerWidth <= 576 ? "8px" : "12px",
    borderBottom: "1px solid #dee2e6",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem",
  };

  const actionButtonStyle = {
    padding: window.innerWidth <= 576 ? "8px" : "10px",
    borderRadius: "50%",
    border: "none",
    fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem",
    cursor: "pointer",
    margin: "0 2px",
    width: window.innerWidth <= 576 ? "32px" : "36px",
    height: window.innerWidth <= 576 ? "32px" : "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "50px" }}>
        Loading enquiries...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      
      {/* Statistics Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: window.innerWidth <= 576 ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "15px",
        marginBottom: "20px",
        width: "100%",
        maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #4a90e2, #357abd)",
          color: "white",
          padding: window.innerWidth <= 576 ? "15px" : "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", marginBottom: "5px" }}>📊</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold" }}>{totalEnquiries}</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", opacity: 0.9 }}>Total Enquiries</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #ffc107, #e0a800)",
          color: "white",
          padding: window.innerWidth <= 576 ? "15px" : "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", marginBottom: "5px" }}>🆕</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold" }}>{newEnquiries}</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", opacity: 0.9 }}>New Enquiries</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #007bff, #0056b3)",
          color: "white",
          padding: window.innerWidth <= 576 ? "15px" : "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", marginBottom: "5px" }}>👁️</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold" }}>{readEnquiries}</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", opacity: 0.9 }}>Read Enquiries</div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, #28a745, #1e7e34)",
          color: "white",
          padding: window.innerWidth <= 576 ? "15px" : "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", marginBottom: "5px" }}>✅</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold" }}>{resolvedEnquiries}</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", opacity: 0.9 }}>Resolved Enquiries</div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={searchContainerStyle}>
        <h3 style={{ 
          margin: "0 0 20px 0", 
          color: "#1a3c34", 
          fontSize: window.innerWidth <= 576 ? "1.3rem" : "1.5rem",
          textAlign: "center"
        }}>
          🔍 Search & Filter Enquiries
        </h3>
        
        <div style={searchRowStyle}>
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div style={searchRowStyle}>
          <input
            type="date"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={inputStyle}
          />
          
          <input
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={inputStyle}
          />
          
          <button
            onClick={clearFilters}
            style={{
              ...buttonStyle,
              background: "#6c757d",
              color: "white",
            }}
          >
            🗑️ Clear Filters
          </button>
        </div>
        
        <div style={{ 
          textAlign: "center", 
          color: "#6c757d", 
          fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.9rem",
          marginTop: "10px"
        }}>
          Showing {filteredEnquiries.length} of {enquiries.length} enquiries
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h2 style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", margin: 0 }}>
          📧 Patient Enquiries
        </h2>
      </div>

      {filteredEnquiries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📬</div>
          <p style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", color: "#6c757d" }}>
            {enquiries.length === 0 ? "No enquiries found." : "No enquiries match your search criteria."}
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("timestamp")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by date"
                >
                  Date {getSortIcon("timestamp")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("name")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by name"
                >
                  Name {getSortIcon("name")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("email")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by email"
                >
                  Email {getSortIcon("email")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("subject")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by subject"
                >
                  Subject {getSortIcon("subject")}
                </th>
                <th style={thStyle}>Message</th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("status")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by status"
                >
                  Status {getSortIcon("status")}
                </th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map(enquiry => (
                <tr key={enquiry.id} style={{
                  backgroundColor: enquiry.status === "new" ? "#fff3cd" : "transparent"
                }}>
                  <td style={tdStyle}>{formatDate(enquiry.timestamp)}</td>
                  <td style={tdStyle}>{enquiry.name}</td>
                  <td style={tdStyle}>{enquiry.email}</td>
                  <td style={tdStyle}>{enquiry.subject}</td>
                  <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {enquiry.message}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                      color: "white",
                      backgroundColor:
                        enquiry.status === "new" ? "#ffc107" :
                        enquiry.status === "read" ? "#007bff" :
                        enquiry.status === "resolved" ? "#28a745" : "#6c757d",
                    }}>
                      {enquiry.status || "new"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {enquiry.status !== "read" && enquiry.status !== "resolved" && (
                        <button
                          onClick={() => handleStatusChange(enquiry.id, "read")}
                          style={{ 
                            ...actionButtonStyle, 
                            background: "#007bff", 
                            color: "white",
                          }}
                          title="Mark as Read"
                          onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                        >
                          👁
                        </button>
                      )}
                      {enquiry.status !== "resolved" && (
                        <button
                          onClick={() => handleStatusChange(enquiry.id, "resolved")}
                          style={{ 
                            ...actionButtonStyle, 
                            background: "#28a745", 
                            color: "white",
                          }}
                          title="Mark as Resolved"
                          onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => window.location.href = `mailto:${enquiry.email}?subject=Re: ${enquiry.subject}`}
                        style={{ 
                          ...actionButtonStyle, 
                          background: "#17a2b8", 
                          color: "white",
                        }}
                        title="Reply via Email"
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                      >
                        📧
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
