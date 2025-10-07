import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PostTreatmentTracker({ appointmentId, dentistId }) {
  const { currentUser } = useAuth();
  const [recoveryData, setRecoveryData] = useState({
    painLevel: 3,
    swelling: false,
    medicationTaken: false,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('Rendering PostTreatmentTracker with:', { appointmentId, dentistId, currentUser });

  useEffect(() => {
    if (!appointmentId || !currentUser?.uid) {
      console.warn('Missing required props for PostTreatmentTracker');
      return;
    }

    const fetchRecoveryLogs = async () => {
      setLoading(true);
      try {
        console.log('Fetching recovery logs for appointment:', appointmentId);
        const q = query(
          collection(db, 'recoveryLogs'),
          where('appointmentId', '==', appointmentId),
          where('patientId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecoveryLogs(logs);
        console.log('Found recovery logs:', logs);
      } catch (err) {
        console.error('Error fetching recovery logs:', err);
        setError('Failed to load recovery history');
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryLogs();
  }, [appointmentId, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecoveryData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    try {
      console.log('Submitting recovery data:', recoveryData);
      await addDoc(collection(db, 'recoveryLogs'), {
        appointmentId,
        patientId: currentUser.uid,
        dentistId,
        ...recoveryData,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      
      // Refresh the logs
      const q = query(
        collection(db, 'recoveryLogs'),
        where('appointmentId', '==', appointmentId),
        where('patientId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecoveryLogs(logs);
      
      // Reset form
      setTimeout(() => {
        setRecoveryData({
          painLevel: 3,
          swelling: false,
          medicationTaken: false,
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting recovery data:', err);
      setError('Failed to submit recovery data. Please try again.');
    }
  };

  const checkForAlerts = () => {
    if (recoveryLogs.length === 0) return null;
    
    const latestLog = recoveryLogs[0];
    // Check for high pain level
    if (latestLog.painLevel >= 7) {
      return (
        <div className="alert alert-danger">
          <strong>High pain level reported ({latestLog.painLevel}/10)!</strong> Please contact the clinic if this persists.
        </div>
      );
    }
    
    // Check for persistent pain
    if (recoveryLogs.length >= 3) {
      const recentLogs = recoveryLogs.slice(0, 3);
      if (recentLogs.every(log => log.painLevel >= 5)) {
        return (
          <div className="alert alert-warning">
            <strong>Persistent pain detected.</strong> Consider contacting the clinic for advice.
          </div>
        );
      }
    }
    
    return null;
  };

  if (!appointmentId) {
    return <div className="alert alert-warning">No appointment selected for tracking</div>;
  }

  return (
    <div className="post-treatment-tracker">
      <h5>Post-Treatment Recovery Tracker</h5>
      {checkForAlerts()}
      
      {loading ? (
        <p>Loading recovery history...</p>
      ) : recoveryLogs.length > 0 ? (
        <div className="recovery-history">
          <h6>Your Recovery Progress:</h6>
          {recoveryLogs.map((log) => (
            <div key={log.id} className="recovery-log">
              <div><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</div>
              <div><strong>Pain Level:</strong> {log.painLevel}/10</div>
              <div><strong>Swelling:</strong> {log.swelling ? 'Yes' : 'No'}</div>
              <div><strong>Medication Taken:</strong> {log.medicationTaken ? 'Yes' : 'No'}</div>
              {log.notes && <div><strong>Notes:</strong> {log.notes}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p>No recovery data logged yet.</p>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="recovery-form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={recoveryData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Pain Level (1-10): {recoveryData.painLevel}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              name="painLevel"
              value={recoveryData.painLevel}
              onChange={handleChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="swelling"
              name="swelling"
              checked={recoveryData.swelling}
              onChange={handleChange}
            />
            <label htmlFor="swelling">Experiencing swelling</label>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="medicationTaken"
              name="medicationTaken"
              checked={recoveryData.medicationTaken}
              onChange={handleChange}
            />
            <label htmlFor="medicationTaken">Took prescribed medication</label>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={recoveryData.notes}
              onChange={handleChange}
              placeholder="Describe your symptoms or any concerns"
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {submitted && <div className="alert alert-success">Recovery data submitted successfully!</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitted}>
              {submitted ? 'Submitting...' : 'Submit'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
              disabled={submitted}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Log Recovery Update
        </button>
      )}
    </div>
  );
}