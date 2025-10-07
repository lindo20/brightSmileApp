import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

const AdminAppointmentManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dentists, setDentists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookersUsernames, setBookersUsernames] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState("all");
  
  // New search and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch all dentists
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "dentist"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const dentistsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Dentists data:", dentistsData); // Debug log
          setDentists(dentistsData);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching dentists:", error);
      }
    };

    fetchDentists();
  }, []);

  // Helper to fetch a username by userId from both users and patients collections
  const fetchUsername = async (userId) => {
    if (!userId) return "Unknown";
    try {
      // First try to get from users collection
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.username || data.fullName || data.email || "Unknown";
      }
      
      // If not found in users, try patients collection
      const patientDoc = await getDoc(doc(db, "patients", userId));
      if (patientDoc.exists()) {
        const data = patientDoc.data();
        return data.fullName || data.email || "Unknown";
      }
      
      return "Unknown";
    } catch (error) {
      console.error("Error fetching username for userId:", userId, error);
      return "Unknown";
    }
  };

  // Helper to fetch patient info directly
  const fetchPatientInfo = async (patientId) => {
    if (!patientId) return null;
    try {
      const patientDoc = await getDoc(doc(db, "patients", patientId));
      if (patientDoc.exists()) {
        return patientDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching patient info:", error);
      return null;
    }
  };

  // Helper to get dentist name
  const getDentistName = (dentistId) => {
    const dentist = dentists.find(d => d.id === dentistId);
    return dentist ? (dentist.fullName || dentist.username || dentist.email || "Unknown Dentist") : "Unknown Dentist";
  };

  // Fetch appointments
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appointmentsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate?.() || data.date,
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log("Appointments data:", appointmentsData); // Debug log

      // Filter by date and status
      const now = new Date();
      const filteredAppointments = appointmentsData.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        switch (filter) {
          case "today":
            return appointmentDate.toDateString() === now.toDateString();
          case "upcoming":
            return appointmentDate >= now && appointment.status === "pending";
          case "past":
            return appointmentDate < now;
          default:
            return true;
        }
      });

      // Fetch usernames for bookers AND patient info
      const newUsernames = { ...bookersUsernames };
      await Promise.all(
        filteredAppointments.map(async (appointment) => {
          // Fetch booker info
          if (appointment.bookedBy && !newUsernames[appointment.bookedBy]) {
            const username = await fetchUsername(appointment.bookedBy);
            newUsernames[appointment.bookedBy] = username;
          }
          
          // Fetch patient info if patientId exists
          if (appointment.patientId && !newUsernames[appointment.patientId]) {
            const patientInfo = await fetchPatientInfo(appointment.patientId);
            if (patientInfo) {
              newUsernames[appointment.patientId] = patientInfo.fullName || patientInfo.email || "Unknown";
            }
          }
        })
      );

      setBookersUsernames(newUsernames);
      setAppointments(filteredAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookersUsernames, currentUser, filter]);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  };

  // Get patient display name
  const getPatientDisplayName = (appointment) => {
    // If appointment has a direct patientName field, use it
    if (appointment.patientName && appointment.patientName !== "Unknown") {
      return appointment.patientName;
    }
    
    // If it's for myself, use the booker's name
    if (
      appointment.patientName?.toLowerCase?.() === "myself" ||
      appointment.forMyself === true
    ) {
      return bookersUsernames[appointment.bookedBy] || "Unknown";
    }
    
    // Try to use patientId to get the name
    if (appointment.patientId && bookersUsernames[appointment.patientId]) {
      return bookersUsernames[appointment.patientId];
    }
    
    // Fallback to booker's name
    return bookersUsernames[appointment.bookedBy] || "Unknown";
  };

  // Handle appointment actions
  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleStatusChangeClick = (appointment, status) => {
    setAppointmentToUpdate(appointment);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;

    setUpdatingStatus(true);
    try {
      const appointmentRef = doc(db, "appointments", appointmentToCancel.id);
      await updateDoc(appointmentRef, {
        status: "cancelled",
        cancelledBy: currentUser.uid,
        cancelledAt: new Date(),
      });
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!appointmentToUpdate || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const appointmentRef = doc(db, "appointments", appointmentToUpdate.id);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "appointments", appointmentToDelete.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/admin");
  };

  // Enhanced filtering and sorting function
  const getFilteredAndSortedAppointments = () => {
    let filtered = appointments.filter(appointment => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const patientName = getPatientDisplayName(appointment).toLowerCase();
      const dentistName = getDentistName(appointment.dentistId).toLowerCase();
      const reason = appointment.reason?.toLowerCase() || "";
      
      const matchesSearch = !searchTerm || 
        patientName.includes(searchLower) ||
        dentistName.includes(searchLower) ||
        reason.includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

      // Dentist filter
      const matchesDentist = dentistFilter === "all" || appointment.dentistId === dentistFilter;

      // Date range filter
      const appointmentDate = new Date(appointment.date);
      const matchesDateFrom = !dateFrom || appointmentDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || appointmentDate <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDentist && matchesDateFrom && matchesDateTo;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "patient":
          aValue = getPatientDisplayName(a).toLowerCase();
          bValue = getPatientDisplayName(b).toLowerCase();
          break;
        case "dentist":
          aValue = getDentistName(a.dentistId).toLowerCase();
          bValue = getDentistName(b.dentistId).toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "time":
          aValue = a.time;
          bValue = b.time;
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
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setDentistFilter("all");
    setSortField("date");
    setSortDirection("desc");
  };

  const filteredAppointments = getFilteredAndSortedAppointments();

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

  const modalStyle = {
    display: "block",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1050,
    overflowY: window.innerWidth <= 576 ? "auto" : "visible",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalContentStyle = {
    background: "white",
    padding: window.innerWidth <= 576 ? "15px" : "20px",
    borderRadius: "8px",
    maxWidth: window.innerWidth <= 576 ? "95%" : "500px",
    width: "100%",
    textAlign: "center",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "50px" }}>
        Loading appointments...
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
          🔍 Search & Filter Appointments
        </h3>
        
        <div style={searchRowStyle}>
          <input
            type="text"
            placeholder="Search by patient, dentist, or reason..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={dentistFilter}
            onChange={(e) => setDentistFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Dentists</option>
            {dentists.map(dentist => (
              <option key={dentist.id} value={dentist.id}>
                {dentist.name}
              </option>
            ))}
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
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h2 style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", margin: 0 }}>
          🦷 Appointment Management
        </h2>
      </div>

      {filteredAppointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📅</div>
          <p style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", color: "#6c757d" }}>
            {appointments.length === 0 ? "No appointments found." : "No appointments match your search criteria."}
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("dentist")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by dentist"
                >
                  Dentist {getSortIcon("dentist")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("patient")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by patient"
                >
                  Patient {getSortIcon("patient")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("date")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by date"
                >
                  Date {getSortIcon("date")}
                </th>
                <th 
                  style={thStyle} 
                  onClick={() => handleSort("time")}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  title="Click to sort by time"
                >
                  Time {getSortIcon("time")}
                </th>
                <th style={thStyle}>Reason</th>
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
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td style={tdStyle}>{getDentistName(appointment.dentistId)}</td>
                  <td style={tdStyle}>{getPatientDisplayName(appointment)}</td>
                  <td style={tdStyle}>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{formatTime(appointment.time)}</td>
                  <td style={tdStyle}>{appointment.reason}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                      color: "white",
                      backgroundColor:
                        appointment.status === "confirmed" ? "#28a745" :
                        appointment.status === "pending" ? "#ffc107" :
                        appointment.status === "completed" ? "#007bff" :
                        appointment.status === "cancelled" ? "#dc3545" : "#6c757d",
                    }}>
                      {appointment.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(appointment.status === "confirmed" || appointment.status === "pending") && (
                        <>
                          <button
                        onClick={() => handleCancelClick(appointment)}
                        style={{ ...actionButtonStyle, background: "#dc3545", color: "white" }}
                        disabled={updatingStatus}
                        title="Cancel Appointment"
                      >
                        ✗
                      </button>
                          {appointment.status === "pending" && (
                            <button
                              onClick={() => handleStatusChangeClick(appointment, "confirmed")}
                              style={{ ...actionButtonStyle, background: "#28a745", color: "white" }}
                              disabled={updatingStatus}
                              title="Confirm Appointment"
                            >
                              ✓
                            </button>
                          )}
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusChangeClick(appointment, "completed")}
                          style={{ ...actionButtonStyle, background: "#007bff", color: "white" }}
                          disabled={updatingStatus}
                          title="Mark as Completed"
                        >
                          ✓✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(appointment)}
                        style={{ ...actionButtonStyle, background: "#343a40", color: "white" }}
                        disabled={deleting}
                        title="Delete Appointment"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>
              <h5 style={{ margin: 0, fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem" }}>
                Confirm Cancellation
              </h5>
              <button
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setShowCancelModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "15px" }}>
              {appointmentToCancel && (
                <>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem" }}>
                    Are you sure you want to cancel this appointment?
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Patient:</strong> {getPatientDisplayName(appointmentToCancel)}
                  </p>
                  {appointmentToCancel.dentistId && (
                    <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                      <strong>Dentist:</strong> {getDentistName(appointmentToCancel.dentistId)}
                    </p>
                  )}
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Reason:</strong> {appointmentToCancel.reason}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Date:</strong> {new Date(appointmentToCancel.date).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Time:</strong> {formatTime(appointmentToCancel.time)}
                  </p>
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "10px" }}>
              <button
                style={{ ...buttonStyle, background: "#6c757d", color: "white" }}
                onClick={() => setShowCancelModal(false)}
                disabled={updatingStatus}
              >
                No, Keep Appointment
              </button>
              <button
                style={{ ...buttonStyle, background: "#dc3545", color: "white" }}
                onClick={confirmCancel}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Cancelling..." : "Yes, Cancel Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>
              <h5 style={{ margin: 0, fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem" }}>
                Confirm Status Change
              </h5>
              <button
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setShowStatusModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "15px" }}>
              {appointmentToUpdate && (
                <>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem" }}>
                    Are you sure you want to change the status of this appointment to <strong>{newStatus}</strong>?
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Patient:</strong> {getPatientDisplayName(appointmentToUpdate)}
                  </p>
                  {appointmentToUpdate.dentistId && (
                    <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                      <strong>Dentist:</strong> {getDentistName(appointmentToUpdate.dentistId)}
                    </p>
                  )}
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Reason:</strong> {appointmentToUpdate.reason}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Date:</strong> {new Date(appointmentToUpdate.date).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Time:</strong> {formatTime(appointmentToUpdate.time)}
                  </p>
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "10px" }}>
              <button
                style={{ ...buttonStyle, background: "#6c757d", color: "white" }}
                onClick={() => setShowStatusModal(false)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                style={{ ...buttonStyle, background: "#007bff", color: "white" }}
                onClick={confirmStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>
              <h5 style={{ margin: 0, fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem" }}>
                Confirm Deletion
              </h5>
              <button
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "15px" }}>
              {appointmentToDelete && (
                <>
                  <p style={{ color: "#dc3545", fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem" }}>
                    Warning: This action cannot be undone!
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem" }}>
                    Are you sure you want to permanently delete this appointment?
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Patient:</strong> {getPatientDisplayName(appointmentToDelete)}
                  </p>
                  {appointmentToDelete.dentistId && (
                    <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                      <strong>Dentist:</strong> {getDentistName(appointmentToDelete.dentistId)}
                    </p>
                  )}
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Reason:</strong> {appointmentToDelete.reason}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Date:</strong> {new Date(appointmentToDelete.date).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem" }}>
                    <strong>Time:</strong> {formatTime(appointmentToDelete.time)}
                  </p>
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "10px" }}>
              <button
                style={{ ...buttonStyle, background: "#6c757d", color: "white" }}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                style={{ ...buttonStyle, background: "#dc3545", color: "white" }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
          

    </div>
  );
};

export default AdminAppointmentManagement;