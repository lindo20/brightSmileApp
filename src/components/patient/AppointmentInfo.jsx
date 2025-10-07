import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import PostTreatmentTracker from './PostTreatmentTracker';

const AppointmentInfo = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState({});
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    reason: '',
    status: '',
    dentistId: ''
  });

   const [viewingRecoveryFor, setViewingRecoveryFor] = useState(null);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Success message
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dentist list for dropdowns
  const [dentistList, setDentistList] = useState([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Fetch appointments
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appointmentsData = [];
      const dentistData = {};
      const patientData = {};

      for (const docSnap of snapshot.docs) {
        const appointment = { id: docSnap.id, ...docSnap.data() };
        
        if (appointment.uid === currentUser.uid || appointment.patientId === currentUser.uid) {
          appointmentsData.push(appointment);

          // Fetch dentist data
          if (appointment.dentistId && !dentistData[appointment.dentistId]) {
            try {
              const dentistDoc = await getDoc(doc(db, 'dentists', appointment.dentistId));
              if (dentistDoc.exists()) {
                dentistData[appointment.dentistId] = dentistDoc.data();
              }
            } catch (error) {
              console.error('Error fetching dentist:', error);
            }
          }

          // Fetch patient data
          const patientId = appointment.patientId || appointment.uid;
          if (patientId && !patientData[patientId]) {
            try {
              const userDoc = await getDoc(doc(db, 'users', patientId));
              if (userDoc.exists()) {
                patientData[patientId] = userDoc.data();
              }
            } catch (error) {
              console.error('Error fetching patient:', error);
            }
          }
        }
      }

      setDentists(dentistData);
      setPatients(patientData);
      setAppointments(appointmentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch dentists for dropdowns
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const q = query(collection(db, 'dentists'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const dentistsList = [];
          snapshot.forEach((docSnap) => {
            dentistsList.push({ id: docSnap.id, ...docSnap.data() });
          });
          setDentistList(dentistsList);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching dentists:', error);
      }
    };

    fetchDentists();
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Enhanced filtering and sorting function
  const getFilteredAndSortedAppointments = () => {
    const now = new Date();
    let filtered = appointments.filter(appt => {
      const appointmentDate = new Date(appt.date);
      
      // Tab filtering
      if (activeTab === 'upcoming') {
        if (appointmentDate < now || appt.status === 'cancelled') return false;
      } else if (activeTab === 'history') {
        if (appointmentDate >= now && appt.status !== 'cancelled') return false;
      }

      // Enhanced search term filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const patientName = getPatientName(appt).toLowerCase();
        const dentistName = (dentists[appt.dentistId]?.fullName || '').toLowerCase();
        const reason = (appt.reason || '').toLowerCase();
        const status = (appt.status || '').toLowerCase();
        const dateStr = new Date(appt.date).toLocaleDateString().toLowerCase();
        
        if (!patientName.includes(searchLower) && 
            !dentistName.includes(searchLower) && 
            !reason.includes(searchLower) &&
            !status.includes(searchLower) &&
            !dateStr.includes(searchLower)) {
          return false;
        }
      }

      // Status filtering
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }

      // Reason filtering
      if (reasonFilter !== 'all' && appt.reason !== reasonFilter) {
        return false;
      }

      // Date filtering
      if (dateFilter !== 'all') {
        const appointmentDate = new Date(appt.date);
        const today = new Date();
        const daysDiff = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            if (daysDiff !== 0) return false;
            break;
          case 'week':
            if (daysDiff < 0 || daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff < 0 || daysDiff > 30) return false;
            break;
          case 'past':
            if (daysDiff >= 0) return false;
            break;
        }
      }

      return true;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'patient':
          aValue = getPatientName(a).toLowerCase();
          bValue = getPatientName(b).toLowerCase();
          break;
        case 'dentist':
          aValue = (dentists[a.dentistId]?.fullName || '').toLowerCase();
          bValue = (dentists[b.dentistId]?.fullName || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'reason':
          aValue = a.reason || '';
          bValue = b.reason || '';
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Modal functions
  const openDeleteModal = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };

  const openEditModal = (appointment) => {
    setAppointmentToEdit(appointment);
    setEditFormData({
      date: appointment.date ? new Date(appointment.date).toISOString().slice(0, 16) : '',
      reason: appointment.reason || '',
      status: appointment.status || '',
      dentistId: appointment.dentistId || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setAppointmentToEdit(null);
    setEditFormData({
      date: '',
      reason: '',
      status: '',
      dentistId: ''
    });
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'appointments', appointmentToDelete.id));
      closeDeleteModal();
      showSuccess('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!appointmentToEdit) return;
    
    try {
      const appointmentDate = new Date(editFormData.date);
      
      await updateDoc(doc(db, 'appointments', appointmentToEdit.id), {
        date: appointmentDate,
        reason: editFormData.reason,
        status: editFormData.status,
        dentistId: editFormData.dentistId,
        patientId: appointmentToEdit.patientId,
        patientName: appointmentToEdit.patientName,
        uid: appointmentToEdit.uid,
        updatedAt: new Date()
      });
      
      closeEditModal();
      showSuccess('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

   const handleViewRecovery = (appt) => {
    setViewingRecoveryFor(appt);
  };

  // Enhanced styling
 const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', // Green to Blue
  padding: '20px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

  const mainCardStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  const headerStyle = {
  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Match your chosen green
  color: 'white',
  padding: '30px',
  textAlign: 'center',
};

  const searchSectionStyle = {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '25px',
    borderBottom: '1px solid #dee2e6'
  };

  const searchBarStyle = {
    position: 'relative',
    marginBottom: '20px'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '15px 50px 15px 20px',
    border: '2px solid #e9ecef',
    borderRadius: '25px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  };

  const searchIconStyle = {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6c757d',
    fontSize: '18px'
  };

  const filtersGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  };

  const filterSelectStyle = {
    padding: '12px 15px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const tabsStyle = {
    display: 'flex',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '5px',
    marginBottom: '20px'
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '12px 20px',
    textAlign: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#667eea' : 'transparent',
    color: isActive ? 'white' : '#6c757d',
  });



  const statusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };
    
    switch (status) {
      case 'confirmed':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
      default:
        return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41' };
    }
  };



  const appointmentCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e9ecef',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e9ecef'
  };

  const cardBodyStyle = {
    marginBottom: '15px'
  };

  const cardInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const cardLabelStyle = {
    fontWeight: '600',
    color: '#495057',
    fontSize: '14px'
  };

  const cardValueStyle = {
    color: '#2c3e50',
    fontSize: '14px'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    paddingTop: '15px',
    borderTop: '1px solid #e9ecef'
  };

  const actionButtonStyle = (type) => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backgroundColor: type === 'edit' ? '#17a2b8' : '#dc3545',
    color: 'white'
  });



  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6c757d'
  };

  const statisticsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    padding: '25px',
    backgroundColor: '#f8f9fa'
  };

  const statCardStyle = (gradient) => ({
    background: gradient,
    color: 'white',
    padding: '25px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease',
  });

  const filteredAppointments = getFilteredAndSortedAppointments();
  
  // Statistics calculations
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(appt => 
    new Date(appt.date) >= new Date() && appt.status !== 'cancelled'
  ).length;
  const completedAppointments = appointments.filter(appt => appt.status === 'completed').length;
  const pendingAppointments = appointments.filter(appt => appt.status === 'pending').length;

  const getPatientName = (appt) => {
    if (appt.patientName && appt.patientName !== "") {
      return appt.patientName;
    }
    
    if (appt.patientId && patients[appt.patientId]) {
      const patient = patients[appt.patientId];
      if (patient.fullName) return patient.fullName;
      if (patient.name) return patient.name;
      if (patient.firstName && patient.lastName) return `${patient.firstName} ${patient.lastName}`;
    }
    
    if (userData?.fullName) {
      return userData.fullName;
    }
    
    if (appt.uid === currentUser?.uid && userData) {
      if (userData.fullName) return userData.fullName;
      if (userData.name) return userData.name;
    }
    
    return "Unknown Patient";
  };

  const formatReason = (reason) => {
    const reasonMap = {
      'cleaning': 'Dental Cleaning',
      'checkup': 'Regular Checkup',
      'filling': 'Dental Filling',
      'extraction': 'Tooth Extraction',
      'cosmetic': 'Cosmetic Consultation',
      'emergency': 'Emergency',
      'whitening': 'Teeth Whitening'
    };
    return reasonMap[reason] || reason || 'Consultation';
  };

 const renderAppointmentsTable = () => (
  <div style={{ 
    overflowX: 'auto', 
    borderRadius: '10px', 
    border: '1px solid #e9ecef',
    marginTop: '20px'
  }}>
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse',
      minWidth: '800px'
    }}>
      {/* Table Header */}
      <thead>
        <tr style={{ 
          backgroundColor: '#667eea',
        }}>
          <th style={{ 
            padding: '15px', 
            textAlign: 'left', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Patient</th>
          <th style={{ 
            padding: '15px', 
            textAlign: 'left', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Date & Time</th>
          <th style={{ 
            padding: '15px', 
            textAlign: 'left', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Dentist</th>
          <th style={{ 
            padding: '15px', 
            textAlign: 'left', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Reason</th>
          <th style={{ 
            padding: '15px', 
            textAlign: 'left', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Status</th>
          <th style={{ 
            padding: '15px', 
            textAlign: 'center', 
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>Actions</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {filteredAppointments.map((appt, index) => (
          <tr key={appt.id} style={{ 
            backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
          }}>
            {/* Patient Column */}
            <td style={{ 
              padding: '15px',
              fontSize: '14px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>
              {getPatientName(appt)}
              {appt.notes && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6c757d', 
                  marginTop: '5px',
                  fontStyle: 'italic'
                }}>
                  📝 {appt.notes}
                </div>
              )}
            </td>
            
            {/* Date & Time Column */}
            <td style={{ 
              padding: '15px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>
              <div style={{ fontWeight: '500' }}>
                {new Date(appt.date).toLocaleDateString()}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d' 
              }}>
                {new Date(appt.date).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </td>
            
            {/* Dentist Column */}
            <td style={{ 
              padding: '15px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>
              {dentists[appt.dentistId]?.fullName || 'Unknown Dentist'}
            </td>
            
            {/* Reason Column */}
            <td style={{ 
              padding: '15px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>
              {formatReason(appt.reason)}
            </td>
            
            {/* Status Column */}
            <td style={{ padding: '15px' }}>
              <span style={statusBadgeStyle(appt.status)}>
                {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
              </span>
            </td>
            
            {/* Actions Column */}
            <td style={{ 
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => openEditModal(appt)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '60px'
                  }}
                >
                  Edit
                </button>
                
                {(appt.status === 'completed' || appt.status === 'confirmed') && (
                  <button 
                    onClick={() => handleViewRecovery(appt)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      minWidth: '60px'
                    }}
                  >
                    Recovery
                  </button>
                )}
                
                <button 
                  onClick={() => openDeleteModal(appt)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '60px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  
      {/* ADD THIS MODAL RIGHT BEFORE THE CLOSING DIV ↓ */}
      {/* Post Treatment Tracker Modal */}
      {viewingRecoveryFor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e9ecef',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>
                Recovery Tracking - {getPatientName(viewingRecoveryFor)}
              </h2>
              <button 
                onClick={() => setViewingRecoveryFor(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <PostTreatmentTracker 
              appointmentId={viewingRecoveryFor.id}
              dentistId={viewingRecoveryFor.dentistId}
            />
          </div>
        </div>
      )}
    </div> // ← This is your existing closing div
  );

   

 if (loading) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' // Light toned green
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4caf50', // Green spinner
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ margin: 0, color: '#2c3e50', fontSize: '16px' }}>Loading appointments...</p>
      </div>
    </div>
  );
}
  return (
    <div style={containerStyle}>
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          zIndex: 1001,
          fontWeight: '600',
        }}>
          {successMessage}
        </div>
      )}

      <div style={mainCardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
            Appointment Management
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Welcome back, {userData?.fullName || currentUser?.email}
          </p>
        </div>

        {/* Statistics */}
        <div style={statisticsStyle}>
          <div style={statCardStyle('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{totalAppointments}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Appointments</p>
          </div>
          <div style={statCardStyle('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{upcomingAppointments}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Upcoming</p>
          </div>
          <div style={statCardStyle('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{completedAppointments}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Completed</p>
          </div>
          <div style={statCardStyle('linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)')}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{pendingAppointments}</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Pending</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={searchSectionStyle}>
          {/* Enhanced Search Bar */}
          <div style={searchBarStyle}>
            <input
              type="text"
              placeholder="Search by patient name, dentist, reason, status, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
            <span style={searchIconStyle}>🔍</span>
          </div>

          {/* Tabs */}
          <div style={tabsStyle}>
            <div 
              style={tabStyle(activeTab === 'upcoming')}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Appointments
            </div>
            <div 
              style={tabStyle(activeTab === 'history')}
              onClick={() => setActiveTab('history')}
            >
              Appointment History
            </div>
            <div 
              style={tabStyle(activeTab === 'all')}
              onClick={() => setActiveTab('all')}
            >
              All Appointments
            </div>
          </div>

          {/* Filters */}
          <div style={filtersGridStyle}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="all">All Reasons</option>
              <option value="cleaning">Dental Cleaning</option>
              <option value="checkup">Regular Checkup</option>
              <option value="filling">Dental Filling</option>
              <option value="extraction">Tooth Extraction</option>
              <option value="cosmetic">Cosmetic Consultation</option>
              <option value="emergency">Emergency</option>
              <option value="whitening">Teeth Whitening</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="past">Past Appointments</option>
            </select>

            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
              }}
              style={filterSelectStyle}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="patient-asc">Patient (A-Z)</option>
              <option value="patient-desc">Patient (Z-A)</option>
              <option value="dentist-asc">Dentist (A-Z)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>

        {/* Appointments Display */}
  {/* Appointments Display */}
<div style={{ padding: '25px' }}>
  {filteredAppointments.length === 0 ? (
    <div style={emptyStateStyle}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>No appointments found</h3>
      <p style={{ margin: 0 }}>
        {searchTerm || statusFilter !== 'all' || reasonFilter !== 'all' || dateFilter !== 'all'
          ? 'Try adjusting your search criteria or filters'
          : 'You don\'t have any appointments yet'}
      </p>
    </div>
  ) : (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>
          {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
        </h2>
      </div>
      
      {/* REPLACED: Cards with Table */}
      {renderAppointmentsTable()}
    </div>
  )}
</div>

        
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Confirm Cancellation</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>Are you sure you want to cancel this appointment?</p>
            {appointmentToDelete && (
              <div style={{
                margin: '1rem 0', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <p style={{ margin: '5px 0' }}><strong>Date:</strong> {appointmentToDelete.date ? new Date(appointmentToDelete.date).toLocaleDateString() : 'N/A'}</p>
                <p style={{ margin: '5px 0' }}><strong>Dentist:</strong> {dentists[appointmentToDelete.dentistId]?.fullName || 'Unknown Dentist'}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button 
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }} 
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleDeleteAppointment}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Edit Appointment</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                  Date & Time:
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                  Reason:
                </label>
                <select
                  name="reason"
                  value={editFormData.reason}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select reason</option>
                  <option value="cleaning">Dental Cleaning</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="filling">Dental Filling</option>
                  <option value="extraction">Tooth Extraction</option>
                  <option value="cosmetic">Cosmetic Consultation</option>
                  <option value="emergency">Emergency</option>
                  <option value="whitening">Teeth Whitening</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                  Status:
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                  Dentist:
                </label>
                <select
                  name="dentistId"
                  value={editFormData.dentistId}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select dentist</option>
                  {dentistList.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.fullName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }} 
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#28a745',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentInfo;