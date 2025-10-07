import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Profile() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Normalize patient data to handle both field name variations
  const normalizePatientData = (patient) => {
    if (!patient) return null;
    
    return {
      ...patient,
      // Handle both phone and contact fields
      contact: patient.contact || patient.phone,
      // Handle both dateOfBirth and dob fields
      dateOfBirth: patient.dateOfBirth || patient.dob,
      // Ensure fullName exists
      fullName: patient.fullName,
      // Ensure email exists
      email: patient.email
    };
  };

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      try {
        const patientsQuery = query(
          collection(db, 'patients'),
          where('role', '==', 'patient')
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsData = [];
        patientsSnapshot.forEach(doc => {
          const patientData = normalizePatientData({ id: doc.id, ...doc.data() });
          patientsData.push(patientData);
        });
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [currentUser]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!selectedPatient) return;
      try {
        const beneficiariesQuery = query(
          collection(db, 'beneficiaries'),
          where('uid', '==', selectedPatient.id)
        );
        const beneficiariesSnapshot = await getDocs(beneficiariesQuery);
        setBeneficiaries(beneficiariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        
        const recoveryQuery = query(
          collection(db, 'recoveryLogs'),
          where('patientId', '==', selectedPatient.id)
        );
        const recoverySnapshot = await getDocs(recoveryQuery);
        setRecoveryLogs(recoverySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching patient data:', err);
      }
    };
    fetchPatientData();
  }, [selectedPatient]);

  const filteredPatients = patients.filter(patient =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Update the profile tab content to handle both field structures
  const renderProfileInfo = (patient) => {
    const normalizedPatient = normalizePatientData(patient);
    
    return (
      <div style={infoGridStyle}>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Email:</span>
          <span style={infoValueStyle}>{normalizedPatient.email || 'Not provided'}</span>
        </div>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Age:</span>
          <span style={infoValueStyle}>
            {calculateAge(normalizedPatient.dateOfBirth)} years
          </span>
        </div>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Gender:</span>
          <span style={infoValueStyle}>{normalizedPatient.gender || 'Not specified'}</span>
        </div>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Contact:</span>
          <span style={infoValueStyle}>{normalizedPatient.contact || 'Not provided'}</span>
        </div>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Date of Birth:</span>
          <span style={infoValueStyle}>{formatDate(normalizedPatient.dateOfBirth) || 'Not provided'}</span>
        </div>
        <div style={infoRowStyle}>
          <span style={infoLabelStyle}>Address:</span>
          <span style={infoValueStyle}>{normalizedPatient.address || 'Not provided'}</span>
        </div>
      </div>
    );
  };

  // Update the patient list to handle both field structures
  const renderPatientList = () => {
    return filteredPatients.map(patient => {
      const normalizedPatient = normalizePatientData(patient);
      
      return (
        <div
          key={patient.id}
          style={patientCardStyle(selectedPatient?.id === patient.id)}
          onClick={() => {
            setSelectedPatient(normalizedPatient);
            setActiveTab('profile');
          }}
        >
          <div style={patientInfoStyle}>
            <h6 style={patientNameStyle}>{normalizedPatient.fullName}</h6>
            <p style={patientEmailStyle}>{normalizedPatient.email}</p>
          </div>
          {normalizedPatient.dateOfBirth && (
            <span style={ageBadgeStyle}>
              {calculateAge(normalizedPatient.dateOfBirth)} yrs
            </span>
          )}
        </div>
      );
    });
  };

  // Modern styling aligned with Records and Analytics theme
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

  const patientListStyle = {
    display: "grid",
    gridTemplateColumns: window.innerWidth <= 576 ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  };

  const patientCardStyle = (isSelected) => ({
    background: isSelected 
      ? "linear-gradient(135deg, #e3f2fd, #bbdefb)" 
      : "linear-gradient(135deg, #f8f9fa, #ffffff)",
    border: isSelected 
      ? "2px solid #4a90e2" 
      : "2px solid #e9ecef",
    borderRadius: "12px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isSelected 
      ? "0 4px 15px rgba(74, 144, 226, 0.2)" 
      : "0 2px 8px rgba(0,0,0,0.05)",
    transform: isSelected ? "translateY(-2px)" : "translateY(0)",
  });

  const tabsContainerStyle = {
    display: "flex",
    borderBottom: "2px solid #e9ecef",
    marginBottom: "20px",
    overflowX: "auto",
  };

  const tabStyle = {
    padding: window.innerWidth <= 576 ? "8px 16px" : "12px 24px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem",
    fontWeight: "500",
    color: "#6c757d",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  };

  const activeTabStyle = {
    ...tabStyle,
    color: "#4a90e2",
    borderBottomColor: "#4a90e2",
    fontWeight: "600",
  };

  const sectionStyle = {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: window.innerWidth <= 576 ? "15px" : "20px",
    marginBottom: "15px",
  };

  const sectionTitleStyle = {
    fontSize: window.innerWidth <= 576 ? "1.1rem" : "1.3rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "15px",
    borderBottom: "2px solid #4a90e2",
    paddingBottom: "8px",
  };

  const infoRowStyle = {
    display: "flex",
    flexDirection: window.innerWidth <= 576 ? "column" : "row",
    justifyContent: "space-between",
    alignItems: window.innerWidth <= 576 ? "flex-start" : "center",
    padding: "10px 0",
    borderBottom: "1px solid #dee2e6",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#495057",
    marginBottom: window.innerWidth <= 576 ? "5px" : "0",
  };

  const valueStyle = {
    color: "#6c757d",
    fontWeight: "400",
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

  const loadingStyle = {
    textAlign: "center",
    padding: "50px",
    fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem",
    color: "#6c757d",
  };

  const errorStyle = {
    textAlign: "center",
    padding: "20px",
    color: "#dc3545",
    background: "#f8d7da",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  };

  const searchContainerStyle = {
    marginBottom: "20px",
  };

  const loadingSpinnerStyle = {
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #4a90e2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "10px",
  };

  const patientInfoStyle = {
    flex: 1,
  };

  const patientNameStyle = {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "4px",
  };

  const patientEmailStyle = {
    margin: 0,
    fontSize: "0.9rem",
    color: "#6c757d",
  };

  const ageBadgeStyle = {
    background: "linear-gradient(135deg, #34c759, #28a745)",
    color: "white",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6c757d",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "2px dashed #dee2e6",
  };

  const profileContainerStyle = {
    background: "white",
    borderRadius: "12px",
    border: "2px solid #e1e5e9",
    overflow: "hidden",
  };

  const profileHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    background: "linear-gradient(135deg, #f8fbff, #e3f2fd)",
    borderBottom: "1px solid #e1e5e9",
  };

  const profileTitleStyle = {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2c3e50",
  };

  const profileSubtitleStyle = {
    margin: "4px 0 0 0",
    fontSize: "0.9rem",
    color: "#6c757d",
  };

  const clearButtonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "2px solid #dc3545",
    background: "transparent",
    color: "#dc3545",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  };

  const tabContainerStyle = {
    display: "flex",
    borderBottom: "2px solid #e1e5e9",
    background: "#f8f9fa",
    overflowX: "auto",
  };

  const tabButtonStyle = (isActive) => ({
    padding: "12px 20px",
    border: "none",
    background: isActive ? "linear-gradient(135deg, #4a90e2, #34c759)" : "transparent",
    color: isActive ? "white" : "#6c757d",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s ease",
    borderBottom: isActive ? "3px solid transparent" : "3px solid transparent",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  const tabBadgeStyle = {
    background: "rgba(255,255,255,0.3)",
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "0.8rem",
    fontWeight: "600",
  };

  const tabContentStyle = {
    padding: "24px",
  };

  const infoGridStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const infoLabelStyle = {
    fontWeight: "600",
    color: "#495057",
    fontSize: "0.95rem",
  };

  const infoValueStyle = {
    color: "#2c3e50",
    fontSize: "0.95rem",
    textAlign: "right",
    maxWidth: "60%",
    wordBreak: "break-word",
  };

  const tableStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const tableRowStyle = {
    padding: "12px 16px",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e1e5e9",
  };

  const tableCellStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const relationshipStyle = {
    color: "#6c757d",
    fontSize: "0.85rem",
  };

  const dateStyle = {
    color: "#6c757d",
    fontSize: "0.85rem",
  };

  const recoveryDateStyle = {
    fontWeight: "600",
    color: "#495057",
    fontSize: "0.9rem",
  };

  const recoveryNotesStyle = {
    margin: "4px 0 0 0",
    color: "#2c3e50",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  };

  const placeholderStyle = {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #f8fbff, #e3f2fd)",
    borderRadius: "12px",
    border: "2px dashed #4a90e2",
  };

  const placeholderIconStyle = {
    fontSize: "4rem",
    marginBottom: "16px",
    opacity: "0.6",
  };

  const placeholderTitleStyle = {
    margin: "0 0 12px 0",
    color: "#2c3e50",
    fontSize: "1.3rem",
    fontWeight: "600",
  };

  const placeholderTextStyle = {
    margin: 0,
    color: "#6c757d",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  };

  const backButtonContainerStyle = {
    marginTop: "32px",
    textAlign: "center",
  };

  const backButtonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "2px solid #6c757d",
    background: "transparent",
    color: "#6c757d",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Patient Profiles</h2>
          <p style={subtitleStyle}>Manage and view patient information</p>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Patient List */}
          <div style={{ flex: '1 1 350px', minWidth: '320px' }}>
            <div style={searchContainerStyle}>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            
            {loading && (
              <div style={loadingStyle}>
                <div style={loadingSpinnerStyle}></div>
                <span>Loading patients...</span>
              </div>
            )}
            
            {error && (
              <div style={errorStyle}>
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div style={patientListStyle}>
              {renderPatientList()}
              
              {filteredPatients.length === 0 && !loading && (
                <div style={emptyStateStyle}>
                  <p>No patients found</p>
                  <small>Try adjusting your search criteria</small>
                </div>
              )}
            </div>
          </div>

          {/* Patient Profile */}
          <div style={{ flex: '2 1 600px', minWidth: '400px' }}>
            {selectedPatient ? (
              <div style={profileContainerStyle}>
                <div style={profileHeaderStyle}>
                  <div>
                    <h3 style={profileTitleStyle}>{selectedPatient.fullName}'s Profile</h3>
                    <p style={profileSubtitleStyle}>Patient ID: {selectedPatient.id}</p>
                  </div>
                  <button
                    style={clearButtonStyle}
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchTerm('');
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
                
                {/* Tabs */}
                <div style={tabContainerStyle}>
                  {['profile','medical','beneficiaries','recovery'].map(tab => (
                    <button
                      key={tab}
                      style={tabButtonStyle(activeTab === tab)}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab === 'beneficiaries' && beneficiaries.length > 0 && (
                        <span style={tabBadgeStyle}>{beneficiaries.length}</span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div style={tabContentStyle}>
                  {activeTab === 'profile' && renderProfileInfo(selectedPatient)}
                  
                  {activeTab === 'beneficiaries' && (
                    <div>
                      {beneficiaries.length > 0 ? (
                        <div style={tableStyle}>
                          {beneficiaries.map(b => (
                            <div key={b.id} style={tableRowStyle}>
                              <div style={tableCellStyle}>
                                <strong>{b.fullName} {b.surname || ''}</strong>
                                <small style={relationshipStyle}>{b.relation || b.relationship}</small>
                                {b.dateOfBirth && (
                                  <small style={dateStyle}>DOB: {formatDate(b.dateOfBirth)}</small>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={emptyStateStyle}>
                          <p>No beneficiaries registered</p>
                          <small>Beneficiary information will appear here when available</small>
                        </div>
                      )}
                    </div>
                  )}
                  
              
                  
                 {activeTab === 'recovery' && (
  <div>
    {recoveryLogs.length > 0 ? (
      <div style={tableStyle}>
        {recoveryLogs.map(r => (
          <div key={r.id} style={tableRowStyle}>
            <div style={tableCellStyle}>
              <div style={recoveryDateStyle}>
                {formatDate(r.date)} - Pain Level: {r.painLevel || 'N/A'}/10
              </div>
              <div style={{ display: 'flex', gap: '15px', margin: '5px 0' }}>
                <small style={relationshipStyle}>
                  Swelling: {r.swelling ? 'Yes' : 'No'}
                </small>
                <small style={relationshipStyle}>
                  Medication: {r.medicationTaken ? 'Yes' : 'No'}
                </small>
              </div>
              {r.notes && (
                <p style={recoveryNotesStyle}>
                  <strong>Notes:</strong> {r.notes}
                </p>
              )}
              {r.status && (
                <small style={relationshipStyle}>Status: {r.status}</small>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={emptyStateStyle}>
        <p>No recovery logs found</p>
        <small>Recovery progress will appear here when patients log their recovery data</small>
      </div>
    )}
  </div>
)}
                   
                  
                  {activeTab === 'medical' && (
                    <div style={emptyStateStyle}>
                      <div style={placeholderIconStyle}>🏥</div>
                      <h4 style={placeholderTitleStyle}>Medical Records</h4>
                      <p style={placeholderTextStyle}>Medical details and records will be displayed here once available</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={placeholderStyle}>
                <div style={placeholderIconStyle}>👤</div>
                <h4 style={placeholderTitleStyle}>Select a Patient</h4>
                <p style={placeholderTextStyle}>Choose a patient from the list to view their detailed profile and medical information</p>
              </div>
            )}
          </div>
        </div>
        
        <div style={backButtonContainerStyle}>
          <button
            style={backButtonStyle}
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
      
      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}