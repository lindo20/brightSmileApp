import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";

const PRICING = {
  consultation: 1100,
  checkup: 1100,
  cosmeticConsultation: 250,
  childExam: 250,
  xray: 3750,
  scalePolish: 2000,
  airflow: 3125,
  emergency: 3125,
  veneers: 9375,
  composite: 2000,
  compositeRepair: 16250,
  emax: 15000,
  bridge: 3125,
  tempBridge: 3125,
  extraction: 3000,
  rootCanal: 12500,
  braces: 100000,
  implants: 62500,
  whitening: 15000,
};

const getReasonDescription = (reason) => {
  switch (reason) {
    case "checkup":
      return "Regular Checkup";
    case "cleaning":
      return "Teeth Cleaning";
    case "cavity":
      return "Cavity Treatment";
    case "cosmetic":
      return "Cosmetic Consultation";
    case "emergency":
      return "Emergency Appointment";
    case "whitening":
      return "Teeth Whitening";
    default:
      return "Dental Consultation";
  }
};

export default function BookAppointment() {
  const { currentUser, userData } = useAuth();

  const [formData, setFormData] = useState({
    appointmentFor: "",
    date: "",
    time: "",
    dentist: "",
    reason: "",
    notes: "",
  });

  const [dentists, setDentists] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // Fetch user profile data to get the full name
        let userProfileData = null;
        try {
          // Try to get from patient_profiles first
          const patientProfileDoc = await getDoc(
            doc(db, "patient_profiles", currentUser.uid)
          );
          if (patientProfileDoc.exists()) {
            userProfileData = patientProfileDoc.data();
          } else {
            // Fallback to users collection
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              userProfileData = userDoc.data();
            }
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }

        setUserProfile(userProfileData);

        // Set the user's display name
        const displayName = getUserDisplayName(userProfileData);
        setUserDisplayName(displayName);

        // Set the default appointmentFor to the user's name
        setFormData((prev) => ({ ...prev, appointmentFor: displayName }));

        const [dentistSnap, benSnap] = await Promise.all([
          getDocs(collection(db, "dentists")),
          getDocs(
            query(collection(db, "beneficiaries"), where("uid", "==", currentUser.uid))
          ),
        ]);
        setDentists(dentistSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        const benList = benSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        benList.sort((a, b) =>
          `${a.fullName} ${a.surname}`
            .toLowerCase()
            .localeCompare(`${b.fullName} ${b.surname}`.toLowerCase())
        );
        setBeneficiaries(benList);
      } catch {
        setError("Failed to load dentists or beneficiaries.");
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const fallback = PRICING.consultation;
    const reasonPriceMap = {
      checkup: PRICING.checkup,
      cleaning: PRICING.scalePolish,
      cavity: PRICING.composite,
      cosmetic: PRICING.cosmeticConsultation,
      emergency: PRICING.emergency,
      whitening: PRICING.whitening,
    };
    setEstimatedCost(reasonPriceMap[formData.reason] || fallback);
  }, [formData.reason]);

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get the user's proper display name
  const getUserDisplayName = (profileData = null) => {
    const data = profileData || userProfile || userData;

    if (data) {
      // Try different possible field names for the user's name
      if (data.fullName) return data.fullName;
      if (data.name) return data.name;
      if (data.firstName && data.lastName) {
        return `${data.firstName} ${data.lastName}`;
      }
      if (data.firstName) return data.firstName;
    }

    // Final fallback to email
    if (currentUser?.email) return currentUser.email;

    return "Unknown";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      setError("User data not loaded yet. Please wait...");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const selectedDentist = dentists.find((d) => d.id === formData.dentist);
      if (!selectedDentist) throw new Error("Selected dentist not found");
      const appointmentTimestamp = new Date(`${formData.date}T${formData.time}`);

      let patientName = formData.appointmentFor;
      let patientId = currentUser.uid;

      // Check if the selected name is a beneficiary
      const beneficiary = beneficiaries.find((b) => {
        const fullName = `${b.fullName || ""} ${b.surname || ""}`.trim();
        return fullName === formData.appointmentFor;
      });

      if (beneficiary) {
        patientId = beneficiary.id;
      }

      await addDoc(collection(db, "appointments"), {
        uid: currentUser.uid,
        patientId,
        patientName, // This will now contain the proper name instead of email
        dentistId: formData.dentist,
        dentistName: selectedDentist.fullName || "Dentist",
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        notes: formData.notes,
        status: "pending",
        createdByPatient: true,
        createdByDentist: false,
        appointmentTimestamp,
        estimatedCost,
        invoice: {
          amount: estimatedCost,
          status: "pending",
          items: [
            {
              description: getReasonDescription(formData.reason),
              amount: estimatedCost,
            },
          ],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({
        appointmentFor: userDisplayName,
        date: "",
        time: "",
        dentist: "",
        reason: "",
        notes: "",
      });
      setEstimatedCost(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formContainerStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontWeight: 500,
    marginBottom: "0.5rem",
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ced4da",
    marginBottom: "1rem",
    fontSize: "1rem",
    lineHeight: 1.5,
    outline: "none",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "50px",
    cursor: "pointer",
    paddingLeft: "2.5rem",
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
  };

  const alertSuccessStyle = {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "0.75rem 1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  };

  const alertErrorStyle = {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: "0.75rem 1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div style={formContainerStyle}>
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "1.5rem",
            color: "#1a3c34",
          }}
        >
          Book an Appointment
        </h2>

        {success && (
          <div style={alertSuccessStyle}>
            Appointment booked successfully! An invoice will be generated upon
            confirmation.
          </div>
        )}
        {error && <div style={alertErrorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Appointment For */}
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-person-fill" style={{ color: '#4a90e2' }}></i>
              Appointment For*
            </span>
          </label>
          
          <div style={{ marginBottom: '1rem' }}>
            {/* Self Option */}
            <div 
              style={{
                border: formData.appointmentFor === userDisplayName ? '2px solid #4a90e2' : '1px solid #ced4da',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                backgroundColor: formData.appointmentFor === userDisplayName ? '#f0f8ff' : '#fff',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setFormData(prev => ({ ...prev, appointmentFor: userDisplayName }))}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="radio"
                  name="appointmentFor"
                  value={userDisplayName}
                  checked={formData.appointmentFor === userDisplayName}
                  onChange={handleChange}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#1a3c34' }}>
                    <i className="bi bi-person-circle" style={{ marginRight: '0.5rem', color: '#4a90e2' }}></i>
                    {userDisplayName} (Yourself)
                  </div>
                  <small style={{ color: '#6c757d' }}>Book an appointment for yourself</small>
                </div>
              </div>
            </div>

            {/* Beneficiaries Options */}
            {beneficiaries.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#6c757d', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="bi bi-people-fill"></i>
                  Your Beneficiaries:
                </div>
                {beneficiaries.map((b) => {
                  const name = `${b.fullName || ""} ${b.surname || ""}`.trim();
                  return (
                    <div 
                      key={b.id}
                      style={{
                        border: formData.appointmentFor === name ? '2px solid #34c759' : '1px solid #ced4da',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: formData.appointmentFor === name ? '#f0fff4' : '#fff',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, appointmentFor: name }))}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          name="appointmentFor"
                          value={name}
                          checked={formData.appointmentFor === name}
                          onChange={handleChange}
                          style={{ margin: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1a3c34' }}>
                            <i className="bi bi-person-heart" style={{ marginRight: '0.5rem', color: '#34c759' }}></i>
                            {name}
                          </div>
                          <small style={{ color: '#6c757d' }}>
                            {b.relation} • Born: {b.dateOfBirth}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {beneficiaries.length === 0 && (
              <div style={{
                border: '1px dashed #ced4da',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                marginTop: '0.5rem'
              }}>
                <i className="bi bi-person-plus" style={{ fontSize: '1.5rem', color: '#6c757d', marginBottom: '0.5rem' }}></i>
                <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  No beneficiaries added yet.
                </div>
                <Link 
                  to="/add-beneficiaries" 
                  style={{ 
                    color: '#4a90e2', 
                    textDecoration: 'none', 
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Add a beneficiary to book for them
                </Link>
              </div>
            )}
          </div>

          {/* Date */}
          <label style={labelStyle}>Date*</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            style={inputStyle}
            required
          />
          <medium style={{ color: "#6c757d" }}>Please select a date between Monday and Saturday.</medium>

          {/* Time */}
          <label style={labelStyle}>Time*</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            min="09:00"
            max="17:00"
            style={inputStyle}
            required
          />
          <medium style={{ color: "#6c757d" }}>Please select a time between 9AM and 5PM.</medium>

          {/* Dentist */}
          <label style={labelStyle}>Dentist*</label>
          <select
            name="dentist"
            value={formData.dentist}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select a dentist</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.fullName} ({d.specialization || "General Dentistry"})
              </option>
            ))}
          </select>
          <medium style={{ color: "#6c757d" }}>Please choose a dentist.</medium>

          {/* Reason */}
          <label style={labelStyle}>Reason for Visit*</label>
          <select
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select a reason</option>
            <option value="checkup">
              Regular Checkup (R{PRICING.checkup})
            </option>
            <option value="cleaning">
              Teeth Cleaning (R{PRICING.scalePolish})
            </option>
            <option value="cavity">
              Cavity Treatment (R{PRICING.composite})
            </option>
            <option value="cosmetic">
              Cosmetic Consultation (R{PRICING.cosmeticConsultation})
            </option>
            <option value="emergency">Emergency Appointment (R{PRICING.emergency}+)</option>
            <option value="whitening">
              Teeth Whitening (R{PRICING.whitening})
            </option>
            <option value="other">
              Other (Consultation R{PRICING.consultation})
            </option>
          </select>
          <medium style={{ color: "#6c757d" }}>Please select a reason.</medium>

          {/* Estimated Cost */}
          {estimatedCost > 0 && (
            <div
              style={{
                backgroundColor: "#cff4fc",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              <strong>Estimated Cost:</strong> R{estimatedCost} <br />
              <medium>Final cost may vary based on actual treatment required.</medium>
            </div>
          )}

          {/* Notes */}
          <label style={labelStyle}>Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Any special requests or concerns"
            style={inputStyle}
          ></textarea>

          {/* Appointment Summary */}
          {formData.appointmentFor && formData.date && formData.time && formData.dentist && formData.reason && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              marginTop: '1rem'
            }}>
              <h6 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#1a3c34',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="bi bi-calendar-check" style={{ color: '#4a90e2' }}></i>
                Appointment Summary
              </h6>
              
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ minWidth: '80px' }}>Patient:</strong>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: formData.appointmentFor === userDisplayName ? '#4a90e2' : '#34c759'
                  }}>
                    <i className={formData.appointmentFor === userDisplayName ? 'bi bi-person-circle' : 'bi bi-person-heart'}></i>
                    {formData.appointmentFor}
                    {formData.appointmentFor === userDisplayName && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d',
                        fontStyle: 'italic'
                      }}>
                        (Yourself)
                      </span>
                    )}
                    {formData.appointmentFor !== userDisplayName && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d',
                        fontStyle: 'italic'
                      }}>
                        (Beneficiary)
                      </span>
                    )}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ minWidth: '80px' }}>Date:</strong>
                  <span>{new Date(formData.date).toLocaleDateString('en-ZA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ minWidth: '80px' }}>Time:</strong>
                  <span>{formData.time}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ minWidth: '80px' }}>Dentist:</strong>
                  <span>Dr. {dentists.find(d => d.id === formData.dentist)?.fullName}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ minWidth: '80px' }}>Reason:</strong>
                  <span>{getReasonDescription(formData.reason)}</span>
                </div>
                
                {estimatedCost > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ minWidth: '80px' }}>Cost:</strong>
                    <span style={{ color: '#34c759', fontWeight: '600' }}>R{estimatedCost}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>

       
      </div>
    </div>
  );
}
