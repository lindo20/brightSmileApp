import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // New search and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "patientFeedback"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push({ id: doc.id, ...doc.data() });
      });
      setFeedback(feedbackData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await updateDoc(doc(db, "patientFeedback", feedbackId), {
        status: "read",
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking feedback as read:", error);
    }
  };

  const handleArchive = async (feedbackId) => {
    try {
      await updateDoc(doc(db, "patientFeedback", feedbackId), {
        status: "archived",
        archivedAt: new Date(),
      });
    } catch (error) {
      console.error("Error archiving feedback:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? "#ffc107" : "#e4e5e9", fontSize: "1.2rem" }}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  // Enhanced filtering and sorting function
  const getFilteredAndSortedFeedback = () => {
    let filtered = feedback.filter(item => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const patientName = item.patientName?.toLowerCase() || "";
      const comments = item.comments?.toLowerCase() || "";
      const feedbackType = item.feedbackType?.toLowerCase() || "";
      
      const matchesSearch = !searchTerm || 
        patientName.includes(searchLower) ||
        comments.includes(searchLower) ||
        feedbackType.includes(searchLower);

      // Rating filter
      const matchesRating = ratingFilter === "all" || 
        (ratingFilter === "5" && item.rating === 5) ||
        (ratingFilter === "4" && item.rating === 4) ||
        (ratingFilter === "3" && item.rating === 3) ||
        (ratingFilter === "2" && item.rating === 2) ||
        (ratingFilter === "1" && item.rating === 1) ||
        (ratingFilter === "high" && item.rating >= 4) ||
        (ratingFilter === "low" && item.rating <= 2);

      // Type filter
      const matchesType = typeFilter === "all" || item.feedbackType === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      // Date range filter
      if (item.createdAt) {
        const feedbackDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const matchesDateFrom = !dateFrom || feedbackDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || feedbackDate <= new Date(dateTo);
        return matchesSearch && matchesRating && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
      }

      return matchesSearch && matchesRating && matchesType && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "createdAt":
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          break;
        case "patientName":
          aValue = a.patientName?.toLowerCase() || "";
          bValue = b.patientName?.toLowerCase() || "";
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "feedbackType":
          aValue = a.feedbackType?.toLowerCase() || "";
          bValue = b.feedbackType?.toLowerCase() || "";
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
    setRatingFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortField("createdAt");
    setSortDirection("desc");
  };

  const handleBackClick = () => {
    navigate("/admin-dashboard");
  };

  const filteredFeedback = getFilteredAndSortedFeedback();

  // Calculate statistics
  const totalFeedback = feedback.length;
  const newFeedback = feedback.filter(item => item.status === "new" || !item.status).length;
  const positiveFeedback = feedback.filter(item => item.rating >= 4).length;
  const needsAttention = feedback.filter(item => item.rating <= 2).length;

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

  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: window.innerWidth <= 576 ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "20px",
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "1200px",
  };

  const statCardStyle = {
    background: "white",
    padding: window.innerWidth <= 576 ? "15px" : "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
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
        Loading feedback...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      
      {/* Search and Filter Section */}
      <div style={searchContainerStyle}>
        <h3 style={{ 
          margin: "0 0 20px 0", 
          color: "#1a3c34", 
          fontSize: window.innerWidth <= 576 ? "1.3rem" : "1.5rem",
          textAlign: "center"
        }}>
          🔍 Search & Filter Feedback
        </h3>
        
        <div style={searchRowStyle}>
          <input
            type="text"
            placeholder="Search by patient name, comments, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Ratings</option>
            <option value="high">High (4-5 stars)</option>
            <option value="low">Low (1-2 stars)</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Types</option>
            <option value="service">Service</option>
            <option value="treatment">Treatment</option>
            <option value="staff">Staff</option>
            <option value="facility">Facility</option>
            <option value="general">General</option>
          </select>
        </div>
        
        <div style={searchRowStyle}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          
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
          Showing {filteredFeedback.length} of {feedback.length} feedback entries
        </div>
      </div>

      {/* Statistics Section */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📊</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold", color: "#4a90e2" }}>
            {totalFeedback}
          </div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", color: "#6c757d" }}>
            Total Feedback
          </div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🆕</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold", color: "#ffc107" }}>
            {newFeedback}
          </div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", color: "#6c757d" }}>
            New Feedback
          </div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>😊</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold", color: "#28a745" }}>
            {positiveFeedback}
          </div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", color: "#6c757d" }}>
            Positive (4-5★)
          </div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⚠️</div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", fontWeight: "bold", color: "#dc3545" }}>
            {needsAttention}
          </div>
          <div style={{ fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem", color: "#6c757d" }}>
            Needs Attention
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h2 style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", margin: 0 }}>
          💬 Patient Feedback
        </h2>
      </div>

      {filteredFeedback.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>💭</div>
          <p style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", color: "#6c757d" }}>
            {feedback.length === 0 ? "No feedback found." : "No feedback matches your search criteria."}
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("patientName")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by patient name"
                >
                  Patient Name {getSortIcon("patientName")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("createdAt")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by date"
                >
                  Date {getSortIcon("createdAt")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("rating")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by rating"
                >
                  Rating {getSortIcon("rating")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("feedbackType")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by feedback type"
                >
                  Type {getSortIcon("feedbackType")}
                </th>
                <th style={thStyle}>Comments</th>
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
              {filteredFeedback.map(item => (
                <tr key={item.id} style={{
                  backgroundColor: item.status === "new" || !item.status ? "#fff3cd" : "transparent"
                }}>
                  <td style={tdStyle}>{item.patientName}</td>
                  <td style={tdStyle}>{formatDate(item.createdAt)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2px" }}>
                      {renderStars(item.rating)}
                      <span style={{ marginLeft: "5px", fontSize: "0.9rem", color: "#6c757d" }}>
                        ({item.rating}/5)
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                      backgroundColor: "#e9ecef",
                      color: "#495057",
                    }}>
                      {item.feedbackType}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.comments}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                      color: "white",
                      backgroundColor:
                        item.status === "new" || !item.status ? "#ffc107" :
                        item.status === "read" ? "#007bff" :
                        item.status === "archived" ? "#6c757d" : "#28a745",
                    }}>
                      {item.status || "new"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(item.status === "new" || !item.status) && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
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
                      {item.status !== "archived" && (
                        <button
                          onClick={() => handleArchive(item.id)}
                          style={{ 
                            ...actionButtonStyle, 
                            background: "#6c757d", 
                            color: "white",
                          }}
                          title="Archive Feedback"
                          onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                        >
                          📁
                        </button>
                      )}
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

export default Feedback;