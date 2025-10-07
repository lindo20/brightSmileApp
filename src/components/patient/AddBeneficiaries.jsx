import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import {
  collection, addDoc, getDocs, query, where,
  deleteDoc, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, Link } from 'react-router-dom';

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Child', 'Parent', 'Sibling',
  'Grandparent', 'Other Relative',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const emptyForm = { 
  fullName: '', 
  surname: '', 
  dateOfBirth: '', 
  relation: '', 
  customRelation: '',
  gender: '',
  address: '',
  medicalHistory: '',
  allergies: '',
  currentMedications: '',
  insuranceProvider: '',
  insuranceNumber: ''
};

export default function AddBeneficiaries() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showCustomEdit, setShowCustomEdit] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [showCustom, setShowCustom] = useState(false);
  
  // State for active beneficiary tab
  const [activeBeneficiary, setActiveBeneficiary] = useState(null);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const fetchBeneficiaries = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'beneficiaries'), where('uid', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (`${a.fullName} ${a.surname}`.toLowerCase()).localeCompare(`${b.fullName} ${b.surname}`.toLowerCase()));
      setBeneficiaries(list);
    } catch {
      setError('Failed to load beneficiaries.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    setError('');
    const showCustomRel = value === 'Custom...';
    if (isEdit) {
      setShowCustomEdit(name === 'relation' ? showCustomRel : showCustomEdit);
      setEditForm(prev => ({
        ...prev,
        [name]: showCustomRel && name === 'relation' ? '' : value,
        customRelation: showCustomRel && name === 'relation' ? prev.customRelation : (name === 'customRelation' ? value : prev.customRelation),
      }));
    } else {
      setShowCustom(name === 'relation' ? showCustomRel : showCustom);
      setFormData(prev => ({
        ...prev,
        [name]: showCustomRel && name === 'relation' ? '' : value,
        customRelation: showCustomRel && name === 'relation' ? prev.customRelation : (name === 'customRelation' ? value : prev.customRelation),
      }));
    }
  };

  const validateForm = ({ fullName, surname, dateOfBirth, relation, customRelation }) => {
    if (!fullName.trim() || !surname.trim() || !dateOfBirth) {
      setError('Please fill in all required fields.');
      return false;
    }
    if ((!relation && !customRelation.trim()) || (relation === 'Custom...' && !customRelation.trim())) {
      setError('Please specify the relationship.');
      return false;
    }
    return true;
  };

  const resetForm = (isEdit = false) => {
    if (isEdit) {
      setEditId(null);
      setEditForm(emptyForm);
      setShowCustomEdit(false);
    } else {
      setFormData(emptyForm);
      setShowCustom(false);
    }
  };

  const submitBeneficiary = async (data, isEdit = false) => {
    if (!currentUser) {
      setError('You must be logged in to add a beneficiary.');
      return;
    }
    if (!validateForm(data)) return;

    setIsSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        const ref = doc(db, 'beneficiaries', editId);
        await updateDoc(ref, {
          fullName: data.fullName.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          relation: (showCustomEdit ? data.customRelation : data.relation).trim(),
          gender: data.gender,
          address: data.address,
          medicalHistory: data.medicalHistory,
          allergies: data.allergies,
          currentMedications: data.currentMedications,
          insuranceProvider: data.insuranceProvider,
          insuranceNumber: data.insuranceNumber,
          updatedAt: serverTimestamp(),
        });
        resetForm(true);
      } else {
        await addDoc(collection(db, 'beneficiaries'), {
          uid: currentUser.uid,
          fullName: data.fullName.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          relation: (showCustom ? data.customRelation : data.relation).trim(),
          gender: data.gender,
          address: data.address,
          medicalHistory: data.medicalHistory,
          allergies: data.allergies,
          currentMedications: data.currentMedications,
          insuranceProvider: data.insuranceProvider,
          insuranceNumber: data.insuranceNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        resetForm();
      }
      setSuccess(true);
      fetchBeneficiaries();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(`Failed to ${isEdit ? 'update' : 'add'} beneficiary. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitBeneficiary(formData);
  };

  const saveEdit = () => {
    submitBeneficiary(editForm, true);
  };

  const startEdit = (b) => {
    const isCustom = !RELATIONSHIP_OPTIONS.includes(b.relation);
    setEditId(b.id);
    setEditForm({
      fullName: b.fullName || '',
      surname: b.surname || '',
      dateOfBirth: b.dateOfBirth || '',
      relation: isCustom ? 'Custom...' : b.relation,
      customRelation: isCustom ? b.relation : '',
      gender: b.gender || '',
      address: b.address || '',
      medicalHistory: b.medicalHistory || '',
      allergies: b.allergies || '',
      currentMedications: b.currentMedications || '',
      insuranceProvider: b.insuranceProvider || '',
      insuranceNumber: b.insuranceNumber || ''
    });
    setShowCustomEdit(isCustom);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      await deleteDoc(doc(db, 'beneficiaries', id));
      if (editId === id) resetForm(true);
      if (activeBeneficiary === id) setActiveBeneficiary(null);
      fetchBeneficiaries();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to delete beneficiary. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0" style={{ fontSize: "1.8rem", fontWeight: "600" }}>
                Manage Beneficiaries
              </h2>
              <Link to="/dashboard" className="btn btn-outline-secondary">
                Back to dashboard
              </Link>
            </div>
            
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {success && <div className="alert alert-success mb-3">Operation completed successfully!</div>}

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3" style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                  Beneficiaries ({beneficiaries.length})
                </h4>
                
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : beneficiaries.length === 0 ? (
                  <div className="alert alert-info text-center">No beneficiaries found. Add one below.</div>
                ) : (
                  <div className="row">
                    <div className="col-md-4">
                      <div className="list-group">
                        {beneficiaries.map((b) => (
                          <button
                            key={b.id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeBeneficiary === b.id ? 'active' : ''}`}
                            onClick={() => setActiveBeneficiary(activeBeneficiary === b.id ? null : b.id)}
                          >
                            <span>
                              {b.fullName} {b.surname}
                            </span>
                            {activeBeneficiary === b.id && (
                              <span className="badge bg-light text-dark">▼</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="col-md-8">
                      {activeBeneficiary && beneficiaries.find(b => b.id === activeBeneficiary) && (
                        <div className="card">
                          <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                              {beneficiaries.find(b => b.id === activeBeneficiary).fullName}'s Profile
                            </h5>
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={() => startEdit(beneficiaries.find(b => b.id === activeBeneficiary))}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleDelete(activeBeneficiary)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          <div className="card-body">
                            {editId === activeBeneficiary ? (
                              <div className="edit-form">
                                <div className="row">
                                  <div className="col-md-6">
                                    <input
                                      className="form-control mb-3"
                                      name="fullName"
                                      value={editForm.fullName}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Full Name*"
                                      required
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <input
                                      className="form-control mb-3"
                                      name="surname"
                                      value={editForm.surname}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Surname*"
                                      required
                                    />
                                  </div>
                                </div>
                                
                                <div className="row">
                                  <div className="col-md-6">
                                    <input
                                      type="date"
                                      className="form-control mb-3"
                                      name="dateOfBirth"
                                      value={editForm.dateOfBirth}
                                      onChange={e => handleChange(e, true)}
                                      required
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <select
                                      className="form-select mb-3"
                                      name="gender"
                                      value={editForm.gender}
                                      onChange={e => handleChange(e, true)}
                                    >
                                      <option value="">Select Gender</option>
                                      {GENDER_OPTIONS.map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6">
                                    <select
                                      className="form-select mb-3"
                                      name="relation"
                                      value={editForm.relation}
                                      onChange={e => handleChange(e, true)}
                                      required
                                    >
                                      <option value="">Select relationship</option>
                                      {RELATIONSHIP_OPTIONS.map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-6">
                                    {showCustomEdit && (
                                      <input
                                        className="form-control mb-3"
                                        name="customRelation"
                                        value={editForm.customRelation}
                                        onChange={e => handleChange(e, true)}
                                        placeholder="Specify relationship"
                                        required
                                      />
                                    )}
                                  </div>
                                </div>

                                <textarea
                                  className="form-control mb-3"
                                  name="address"
                                  value={editForm.address}
                                  onChange={e => handleChange(e, true)}
                                  placeholder="Address"
                                  rows={2}
                                />

                                <textarea
                                  className="form-control mb-3"
                                  name="medicalHistory"
                                  value={editForm.medicalHistory}
                                  onChange={e => handleChange(e, true)}
                                  placeholder="Medical History"
                                  rows={2}
                                />

                                <div className="row">
                                  <div className="col-md-6">
                                    <textarea
                                      className="form-control mb-3"
                                      name="allergies"
                                      value={editForm.allergies}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Allergies"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <textarea
                                      className="form-control mb-3"
                                      name="currentMedications"
                                      value={editForm.currentMedications}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Current Medications"
                                      rows={2}
                                    />
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6">
                                    <input
                                      className="form-control mb-3"
                                      name="insuranceProvider"
                                      value={editForm.insuranceProvider}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Insurance Provider"
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <input
                                      className="form-control mb-3"
                                      name="insuranceNumber"
                                      value={editForm.insuranceNumber}
                                      onChange={e => handleChange(e, true)}
                                      placeholder="Insurance Number"
                                    />
                                  </div>
                                </div>

                                <div className="d-flex gap-2">
                                  <button className="btn btn-success w-50" onClick={saveEdit}>Save Changes</button>
                                  <button className="btn btn-outline-secondary w-50" onClick={() => resetForm(true)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <p><strong>Full Name:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).fullName} {beneficiaries.find(b => b.id === activeBeneficiary).surname}</p>
                                    <p><strong>Date of Birth:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).dateOfBirth || 'N/A'}</p>
                                    <p><strong>Age:</strong> {calculateAge(beneficiaries.find(b => b.id === activeBeneficiary).dateOfBirth)}</p>
                                    <p><strong>Gender:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).gender || 'N/A'}</p>
                                    <p><strong>Relationship:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).relation || 'N/A'}</p>
                                  </div>
                                  <div className="col-md-6">
                                    <p><strong>Address:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).address || 'N/A'}</p>
                                    <p><strong>Medical History:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).medicalHistory || 'N/A'}</p>
                                    <p><strong>Allergies:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).allergies || 'N/A'}</p>
                                    <p><strong>Current Medications:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).currentMedications || 'N/A'}</p>
                                    <p><strong>Insurance:</strong> {beneficiaries.find(b => b.id === activeBeneficiary).insuranceProvider || 'N/A'} {beneficiaries.find(b => b.id === activeBeneficiary).insuranceNumber && `(${beneficiaries.find(b => b.id === activeBeneficiary).insuranceNumber})`}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="mb-3" style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                  Add New Beneficiary
                </h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        className="form-control mb-3"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name*"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control mb-3"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Surname*"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control mb-3"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select mb-3"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        {GENDER_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <select
                        className="form-select mb-3"
                        name="relation"
                        value={formData.relation}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIP_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      {showCustom && (
                        <input
                          className="form-control mb-3"
                          name="customRelation"
                          value={formData.customRelation}
                          onChange={handleChange}
                          placeholder="Specify relationship"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <textarea
                    className="form-control mb-3"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    rows={2}
                  />

                  <textarea
                    className="form-control mb-3"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    placeholder="Medical History"
                    rows={2}
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <textarea
                        className="form-control mb-3"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="Allergies"
                        rows={2}
                      />
                    </div>
                    <div className="col-md-6">
                      <textarea
                        className="form-control mb-3"
                        name="currentMedications"
                        value={formData.currentMedications}
                        onChange={handleChange}
                        placeholder="Current Medications"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <input
                        className="form-control mb-3"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleChange}
                        placeholder="Insurance Provider"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control mb-3"
                        name="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={handleChange}
                        placeholder="Insurance Number"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Adding...
                      </>
                    ) : 'Add Beneficiary'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}