import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PostTreatmentTracker from './PostTreatmentTracker';

const UpcomingAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'appointments'),
      where('uid', '==', currentUser.uid), // fetch all appointments created by current user
      where('status', 'in', ['confirmed', 'pending', 'completed'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();

      const appointmentsData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          // Convert Firestore timestamp to JS Date if available
          const apptTimestamp = data.appointmentTimestamp?.toDate
            ? data.appointmentTimestamp.toDate()
            : new Date(`${data.date}T${data.time}`);

          return {
            id: doc.id,
            ...data,
            appointmentDateTime: apptTimestamp,
          };
        })
        // Show only upcoming (future or today) appointments
        .filter(a => a.appointmentDateTime >= now)
        // Sort by appointment date/time ascending
        .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime);

      setAppointments(appointmentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;

    setCancelling(true);
    try {
      const appointmentRef = doc(db, 'appointments', appointmentToCancel.id);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        cancelledBy: currentUser.uid,
        cancelledAt: new Date()
      });
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="upcoming-appointments-loading">Loading appointments...</div>;

  return (
    <div className="upcoming-appointments-container">
      {appointments.length === 0 ? (
        <p className="upcoming-appointments-empty">No upcoming appointments.</p>
      ) : (
        appointments.map(appointment => (
          <div key={appointment.id} className="upcoming-appointment-card">
            <div className="upcoming-appointment-header">
              <h3 className="upcoming-appointment-title">{appointment.reason}</h3>
              <span className={`upcoming-appointment-status upcoming-appointment-status-${appointment.status}`}>
                {appointment.status}
              </span>
            </div>
            <div className="upcoming-appointment-details">
              <p className="upcoming-appointment-detail">
                <strong>Date:</strong> {appointment.appointmentDateTime.toLocaleDateString()}
              </p>
              <p className="upcoming-appointment-detail">
                <strong>Time:</strong> {formatTime(appointment.time)}
              </p>
              <p className="upcoming-appointment-detail">
                <strong>Dentist:</strong> {appointment.dentistName}
              </p>
              <p className="upcoming-appointment-detail">
                <strong>Appointment for:</strong> {appointment.patientName || currentUser.displayName || currentUser.email || 'Unknown'}

              </p>
              {appointment.notes && (
                <p className="upcoming-appointment-detail">
                  <strong>Notes:</strong> {appointment.notes}
                </p>
              )}
            </div>

            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <div className="upcoming-appointment-actions">
                <button
                  onClick={() => handleCancelClick(appointment)}
                  className="upcoming-appointment-cancel-button"
                  disabled={cancelling}
                >
                  Cancel Appointment
                </button>
              </div>
            )}

            {appointment.status === 'completed' && (
              <div className="upcoming-appointment-post-treatment">
                <PostTreatmentTracker
                  appointmentId={appointment.id}
                  dentistId={appointment.dentistId}
                />
              </div>
            )}
          </div>
        ))
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="upcoming-appointments-modal-overlay">
          <div className="upcoming-appointments-modal-content">
            <div className="upcoming-appointments-modal-header">
              <h3 className="upcoming-appointments-modal-title">Confirm Cancellation</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="upcoming-appointments-modal-close-button"
              >
                &times;
              </button>
            </div>
            <div className="upcoming-appointments-modal-body">
              {appointmentToCancel && (
                <>
                  <p>Are you sure you want to cancel your appointment for:</p>
                  <p className="upcoming-appointments-modal-detail"><strong>Reason:</strong> {appointmentToCancel.reason}</p>
                  <p className="upcoming-appointments-modal-detail"><strong>Date:</strong> {new Date(appointmentToCancel.appointmentDateTime).toLocaleDateString()}</p>
                  <p className="upcoming-appointments-modal-detail"><strong>Time:</strong> {formatTime(appointmentToCancel.time)}</p>
                </>
              )}
            </div>
            <div className="upcoming-appointments-modal-footer">
              <button
                onClick={() => setShowCancelModal(false)}
                className="upcoming-appointments-modal-secondary-button"
                disabled={cancelling}
              >
                No, Keep Appointment
              </button>
              <button
                onClick={confirmCancel}
                className="upcoming-appointments-modal-primary-button"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
