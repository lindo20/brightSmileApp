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

const AppointmentScheduling = () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filteredAppointments, setFilteredAppointments] = useState([]);

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

  // Search and filter appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        const patientName = getPatientDisplayName(appointment).toLowerCase();
        const dentistName = getDentistName(appointment.dentistId).toLowerCase();
        const reason = appointment.reason?.toLowerCase() || "";
        const status = appointment.status?.toLowerCase() || "";
        const date = new Date(appointment.date).toLocaleDateString().toLowerCase();
        
        return patientName.includes(searchTerm.toLowerCase()) ||
               dentistName.includes(searchTerm.toLowerCase()) ||
               reason.includes(searchTerm.toLowerCase()) ||
               status.includes(searchTerm.toLowerCase()) ||
               date.includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "patient":
          aValue = getPatientDisplayName(a).toLowerCase();
          bValue = getPatientDisplayName(b).toLowerCase();
          break;
        case "dentist":
          aValue = getDentistName(a.dentistId).toLowerCase();
          bValue = getDentistName(b.dentistId).toLowerCase();
          break;
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "time":
          aValue = a.time || "";
          bValue = b.time || "";
          break;
        case "reason":
          aValue = a.reason?.toLowerCase() || "";
          bValue = b.reason?.toLowerCase() || "";
          break;
        case "status":
          aValue = a.status?.toLowerCase() || "";
          bValue = b.status?.toLowerCase() || "";
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, sortField, sortDirection]);

  // Handle table header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

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

  const buttonStyle = {
    padding: window.innerWidth <= 576 ? "6px 10px" : "8px 12px",
    borderRadius: "50px",
    border: "none",
    fontSize: window.innerWidth <= 576 ? "0.75rem" : "0.85rem",
    cursor: "pointer",
    margin: "0 2px",
  };

  const filterStyle = {
    padding: window.innerWidth <= 576 ? "8px" : "10px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "1rem",
    width: window.innerWidth <= 576 ? "100%" : "200px",
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
        {/* Header */}
        <div style={{ 
          display: "flex", 
          flexDirection: window.innerWidth <= 576 ? "column" : "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "20px", 
          gap: "15px", 
          width: "100%", 
          maxWidth: "1200px" 
        }}>
          <h2 style={{ 
            fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", 
            margin: 0, 
            color: "#2c3e50",
            fontWeight: "700"
          }}>
            🦷 Appointment Management
          </h2>
          
          {/* Search and Filter Controls */}
          <div style={{ 
            display: "flex", 
            flexDirection: window.innerWidth <= 576 ? "column" : "row", 
            gap: "10px", 
            alignItems: "center" 
          }}>
            <input
              type="text"
              placeholder="🔍 Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...filterStyle,
                minWidth: window.innerWidth <= 576 ? "100%" : "250px",
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            />
            <select
              style={{
                ...filterStyle,
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Appointments</option>
              <option value="today">Today's Appointments</option>
              <option value="upcoming">Upcoming (Pending Only)</option>
              <option value="past">Past Appointments</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth <= 576 ? "1fr 1fr" : "repeat(5, 1fr)",
          gap: "15px",
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "20px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.total}</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Total</div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            color: "#8b4513",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.pending}</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Pending</div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            color: "#2d5016",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.confirmed}</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Confirmed</div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
            color: "#1e3a8a",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.completed}</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Completed</div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
            color: "#d63031",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.cancelled}</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Cancelled</div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "15px",
          textAlign: "left"
        }}>
          <span style={{
            background: "#e3f2fd",
            color: "#1976d2",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            📊 Showing {filteredAppointments.length} of {appointments.length} appointments
            {searchTerm && ` for "${searchTerm}"`}
          </span>
        </div>

      {appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
          <i style={{ fontSize: "4rem", color: "#6c757d" }} className="bi bi-calendar-x"></i>
          <h4 style={{ color: "#6c757d", marginTop: "15px" }}>No appointments found</h4>
          <p style={{ color: "#6c757d" }}>
            {filter === "today"
              ? "There are no appointments scheduled for today."
              : filter === "upcoming"
              ? "There are no pending upcoming appointments."
              : "There are no appointments matching your criteria."}
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("dentist")}
                  title="Click to sort by dentist"
                >
                  Dentist {sortField === "dentist" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("patient")}
                  title="Click to sort by patient"
                >
                  Patient {sortField === "patient" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("date")}
                  title="Click to sort by date"
                >
                  Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("time")}
                  title="Click to sort by time"
                >
                  Time {sortField === "time" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("reason")}
                  title="Click to sort by reason"
                >
                  Reason {sortField === "reason" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("status")}
                  title="Click to sort by status"
                >
                  Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
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
                            style={{ ...buttonStyle, background: "#dc3545", color: "white" }}
                            disabled={updatingStatus}
                            title="Cancel Appointment"
                          >
                            ✗
                          </button>
                          {appointment.status === "pending" && (
                            <button
                              onClick={() => handleStatusChangeClick(appointment, "confirmed")}
                              style={{ ...buttonStyle, background: "#28a745", color: "white" }}
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
                          style={{ ...buttonStyle, background: "#007bff", color: "white" }}
                          disabled={updatingStatus}
                          title="Mark as Completed"
                        >
                          ✓✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(appointment)}
                        style={{ ...buttonStyle, background: "#343a40", color: "white" }}
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

export default AppointmentScheduling;