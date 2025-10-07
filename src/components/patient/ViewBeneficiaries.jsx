import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function ViewBeneficiaries() {
  const { currentUser } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchBeneficiaries = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'beneficiaries'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBeneficiaries(list);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      setError('Failed to load beneficiaries.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this beneficiary?');
    if (!confirm) return;

    setDeletingId(id);
    setError('');
    try {
      await deleteDoc(doc(db, 'beneficiaries', id));
      await fetchBeneficiaries();
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
      setError('Failed to delete beneficiary.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div className="card shadow-sm">
          <div className="card-header bg-white border-bottom-0 pt-3 pb-2">
            <h2 className="text-center" style={{ fontSize: '1.4rem', fontWeight: '600' }}>Your Beneficiaries</h2>
          </div>
          <div className="card-body">
            {loading && <p>Loading beneficiaries...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && beneficiaries.length === 0 && <p>No beneficiaries added yet.</p>}

            {!loading && beneficiaries.length > 0 && (
              <ul className="list-group mb-3">
                {beneficiaries.map(b => (
                  <li key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        {b.fullName} {b.surname}
                      </div>
                      <small>{b.relation} – {b.dateOfBirth}</small>
                    </div>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="btn btn-sm btn-danger"
                      disabled={deletingId === b.id}
                      title="Delete beneficiary"
                    >
                      {deletingId === b.id ? 'Deleting...' : <i className="bi bi-trash"></i>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/add-beneficiaries"
                className="btn btn-primary"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Add Beneficiary</span>
                <i className="bi bi-person-plus-fill"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
