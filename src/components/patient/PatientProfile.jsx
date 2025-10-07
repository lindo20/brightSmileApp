import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { 
  doc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, Link } from 'react-router-dom';

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Child', 'Parent', 'Sibling',
  'Grandparent', 'Other Relative', 'Custom...'
];

const emptyForm = { fullName: '', surname: '', dateOfBirth: '', relation: '', customRelation: '' };

export default function PatientProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Beneficiary form state
  const [beneficiaryForm, setBeneficiaryForm] = useState(emptyForm);
  const [showCustom, setShowCustom] = useState(false);
  const [isSubmittingBeneficiary, setIsSubmittingBeneficiary] = useState(false);
  const [beneficiarySuccess, setBeneficiarySuccess] = useState('');
  const [editBeneficiaryId, setEditBeneficiaryId] = useState(null);
  const [editBeneficiaryForm, setEditBeneficiaryForm] = useState(emptyForm);
  const [showCustomEdit, setShowCustomEdit] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!currentUser?.uid) return;
        const docRef = doc(db, 'patients', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFormData(data);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const fetchBeneficiaries = useCallback(async () => {
    if (!currentUser) return;
    setBeneficiariesLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'beneficiaries'), where('uid', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (`${a.fullName} ${a.surname}`.toLowerCase()).localeCompare(`${b.fullName} ${b.surname}`.toLowerCase()));
      setBeneficiaries(list);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      setError('Failed to load beneficiaries.');
    } finally {
      setBeneficiariesLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'beneficiaries') {
      fetchBeneficiaries();
    }
  }, [activeTab, fetchBeneficiaries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBeneficiaryChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    setError('');
    const showCustomRel = value === 'Custom...';
    
    if (isEdit) {
      setShowCustomEdit(name === 'relation' ? showCustomRel : showCustomEdit);
      setEditBeneficiaryForm(prev => ({
        ...prev,
        [name]: showCustomRel && name === 'relation' ? '' : value,
        customRelation: showCustomRel && name === 'relation' ? prev.customRelation : (name === 'customRelation' ? value : prev.customRelation),
      }));
    } else {
      setShowCustom(name === 'relation' ? showCustomRel : showCustom);
      setBeneficiaryForm(prev => ({
        ...prev,
        [name]: showCustomRel && name === 'relation' ? '' : value,
        customRelation: showCustomRel && name === 'relation' ? prev.customRelation : (name === 'customRelation' ? value : prev.customRelation),
      }));
    }
  };

  const validateBeneficiaryForm = ({ fullName, surname, dateOfBirth, relation, customRelation }) => {
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

  const resetBeneficiaryForm = (isEdit = false) => {
    if (isEdit) {
      setEditBeneficiaryId(null);
      setEditBeneficiaryForm(emptyForm);
      setShowCustomEdit(false);
    } else {
      setBeneficiaryForm(emptyForm);
      setShowCustom(false);
    }
  };

  const submitBeneficiary = async (data, isEdit = false) => {
    if (!currentUser) {
      setError('You must be logged in to add a beneficiary.');
      return;
    }
    if (!validateBeneficiaryForm(data)) return;

    setIsSubmittingBeneficiary(true);
    setError('');
    try {
      if (isEdit) {
        const ref = doc(db, 'beneficiaries', editBeneficiaryId);
        await updateDoc(ref, {
          fullName: data.fullName.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          relation: (showCustomEdit ? data.customRelation : data.relation).trim(),
          updatedAt: serverTimestamp(),
        });
        resetBeneficiaryForm(true);
      } else {
        await addDoc(collection(db, 'beneficiaries'), {
          uid: currentUser.uid,
          fullName: data.fullName.trim(),
          surname: data.surname.trim(),
          dateOfBirth: data.dateOfBirth,
          relation: (showCustom ? data.customRelation : data.relation).trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        resetBeneficiaryForm();
      }
      setBeneficiarySuccess(`Beneficiary ${isEdit ? 'updated' : 'added'} successfully!`);
      fetchBeneficiaries();
      setTimeout(() => setBeneficiarySuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isEdit ? 'update' : 'add'} beneficiary. Please try again.`);
    } finally {
      setIsSubmittingBeneficiary(false);
    }
  };

  const handleBeneficiarySubmit = (e) => {
    e.preventDefault();
    submitBeneficiary(beneficiaryForm);
  };

  const saveEdit = () => {
    submitBeneficiary(editBeneficiaryForm, true);
  };

  const startEdit = (b) => {
    const isCustom = !RELATIONSHIP_OPTIONS.includes(b.relation);
    setEditBeneficiaryId(b.id);
    setEditBeneficiaryForm({
      fullName: b.fullName || '',
      surname: b.surname || '',
      dateOfBirth: b.dateOfBirth || '',
      relation: isCustom ? 'Custom...' : b.relation,
      customRelation: isCustom ? b.relation : '',
    });
    setShowCustomEdit(isCustom);
  };

  const handleDeleteBeneficiary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    
    setDeletingId(id);
    setError('');
    try {
      await deleteDoc(doc(db, 'beneficiaries', id));
      if (editBeneficiaryId === id) resetBeneficiaryForm(true);
      fetchBeneficiaries();
      setBeneficiarySuccess('Beneficiary deleted successfully!');
      setTimeout(() => setBeneficiarySuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
      setError('Failed to delete beneficiary. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      const docRef = doc(db, 'patients', currentUser.uid);
      await updateDoc(docRef, formData);
      setProfile(formData);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading)
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #4facfe 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #fff', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 20px' 
          }}></div>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading your profile...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  const containerStyle = {
    minHeight: '100vh',
    background: 'white',
    padding: '20px'
  };

  const mainCardStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: 'white',
    padding: '30px',
    textAlign: 'center'
  };

  const tabsStyle = {
    display: 'flex',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    overflowX: 'auto'
  };

  const tabStyle = (isActive) => ({
    flex: '1',
    padding: '15px 20px',
    border: 'none',
    backgroundColor: isActive ? 'white' : 'transparent',
    color: isActive ? '#667eea' : '#6c757d',
    fontWeight: isActive ? '600' : '400',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
    transition: 'all 0.3s ease',
    minWidth: '120px'
  });

  const contentStyle = {
    padding: '30px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const secondaryButtonStyle = {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const successMessageStyle = {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  };

  const errorMessageStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  };

  const beneficiaryCardStyle = {
    padding: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s ease'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '2px dashed #dee2e6'
  };

  return (
    <div style={containerStyle}>
      <div style={mainCardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Patient Profile</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Manage your personal information and beneficiaries</p>
        </div>

        {/* Navigation Tabs */}
        <div style={tabsStyle}>
          {['profile', 'medical', 'beneficiaries'].map((tab) => (
            <button
              key={tab}
              style={tabStyle(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profile' && '👤 Profile'}
              {tab === 'medical' && '🏥 Medical'}
              {tab === 'beneficiaries' && `👥 Beneficiaries (${beneficiaries.length})`}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={contentStyle}>
          {error && <div style={errorMessageStyle}>{error}</div>}
          {beneficiarySuccess && <div style={successMessageStyle}>{beneficiarySuccess}</div>}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>
                <span>👤</span> Personal Information
              </h2>
              
              {!editMode ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      Profile Details
                    </h3>
                    <button
                      style={buttonStyle}
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Full Name</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.fullName || 'Not specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Email</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{currentUser?.email || 'Not specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Phone</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.phone || 'Not specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Date of Birth</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{formatDate(profile?.dob)}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Age</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{calculateAge(profile?.dob)} years</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Gender</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.gender || 'Not specified'}</div>
                    </div>
                  </div>

                  <div style={{ ...beneficiaryCardStyle, marginTop: '20px' }}>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Address</div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.address || 'Not specified'}</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', marginBottom: '25px' }}>
                    Edit Profile Information
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Email</label>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        style={{ ...inputStyle, backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob || ''}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        style={inputStyle}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Address</label>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      rows="4"
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      style={secondaryButtonStyle}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      style={{
                        ...buttonStyle,
                        backgroundColor: updating ? '#6c757d' : '#667eea'
                      }}
                    >
                      {updating ? 'Updating...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MEDICAL TAB */}
          {activeTab === 'medical' && (
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>
                <span>🏥</span> Medical Information
              </h2>
              
              {!editMode ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      Medical Details
                    </h3>
                    <button
                      style={buttonStyle}
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Edit Medical Info
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Medical History</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.medicalHistory || 'None specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Allergies</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.allergies || 'None specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Current Medications</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.currentMedications || 'None specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Insurance Provider</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.insuranceProvider || 'None specified'}</div>
                    </div>
                    <div style={beneficiaryCardStyle}>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', marginBottom: '8px' }}>Insurance Number</div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{profile?.insuranceNumber || 'None specified'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ color: '#2c3e50', fontSize: '18px', fontWeight: '600', marginBottom: '25px' }}>
                    Edit Medical Information
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Medical History</label>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory || ''}
                        onChange={handleChange}
                        rows="3"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="Describe any relevant medical history"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Allergies</label>
                      <textarea
                        name="allergies"
                        value={formData.allergies || ''}
                        onChange={handleChange}
                        rows="3"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="List any allergies"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Current Medications</label>
                      <textarea
                        name="currentMedications"
                        value={formData.currentMedications || ''}
                        onChange={handleChange}
                        rows="3"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="List current medications"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Insurance Provider</label>
                        <input
                          type="text"
                          name="insuranceProvider"
                          value={formData.insuranceProvider || ''}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Insurance company name"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>Insurance Number</label>
                        <input
                          type="text"
                          name="insuranceNumber"
                          value={formData.insuranceNumber || ''}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Insurance policy number"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      style={secondaryButtonStyle}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      style={{
                        ...buttonStyle,
                        backgroundColor: updating ? '#6c757d' : '#667eea'
                      }}
                    >
                      {updating ? 'Updating...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* BENEFICIARIES TAB */}
          {activeTab === 'beneficiaries' && (
            <div>
              {/* Add Beneficiary Form */}
              <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>
                  <span>👥</span> Add New Beneficiary
                </h2>
                <form onSubmit={handleBeneficiarySubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>First Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={beneficiaryForm.fullName}
                        onChange={(e) => handleBeneficiaryChange(e)}
                        required
                        style={inputStyle}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Last Name *</label>
                      <input
                        type="text"
                        name="surname"
                        value={beneficiaryForm.surname}
                        onChange={(e) => handleBeneficiaryChange(e)}
                        required
                        style={inputStyle}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={beneficiaryForm.dateOfBirth}
                        onChange={(e) => handleBeneficiaryChange(e)}
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Relationship *</label>
                      <select
                        name="relation"
                        value={beneficiaryForm.relation}
                        onChange={(e) => handleBeneficiaryChange(e)}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIP_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {showCustom && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Specify Relationship *</label>
                      <input
                        type="text"
                        name="customRelation"
                        value={beneficiaryForm.customRelation}
                        onChange={(e) => handleBeneficiaryChange(e)}
                        required
                        style={inputStyle}
                        placeholder="Enter custom relationship"
                      />
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSubmittingBeneficiary}
                    style={{
                      ...buttonStyle,
                      backgroundColor: isSubmittingBeneficiary ? '#6c757d' : '#28a745',
                      width: '100%'
                    }}
                  >
                    {isSubmittingBeneficiary ? 'Adding...' : '➕ Add Beneficiary'}
                  </button>
                </form>
              </div>

              {/* Beneficiaries List */}
              <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>
                  <span>📋</span> Beneficiaries List ({beneficiaries.length})
                </h2>

                {beneficiariesLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: '4px solid #e9ecef', 
                      borderTop: '4px solid #667eea', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite', 
                      margin: '0 auto 15px' 
                    }}></div>
                    <p>Loading beneficiaries...</p>
                  </div>
                ) : beneficiaries.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                    <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No beneficiaries added yet</h3>
                    <p style={{ color: '#6c757d', margin: 0 }}>Add your first beneficiary using the form above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {beneficiaries.map((beneficiary) => (
                      <div
                        key={beneficiary.id}
                        style={beneficiaryCardStyle}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '18px' }}>
                              {beneficiary.fullName} {beneficiary.surname}
                            </h4>
                            <span style={{
                              backgroundColor: '#667eea',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {beneficiary.relation}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => startEdit(beneficiary)}
                              style={{
                                ...buttonStyle,
                                padding: '8px 12px',
                                fontSize: '12px',
                                backgroundColor: '#28a745'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                              disabled={deletingId === beneficiary.id}
                              style={{
                                ...buttonStyle,
                                padding: '8px 12px',
                                fontSize: '12px',
                                backgroundColor: '#dc3545'
                              }}
                            >
                              {deletingId === beneficiary.id ? '...' : '🗑️'}
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Date of Birth:</strong> {formatDate(beneficiary.dateOfBirth)}
                          </div>
                          <div>
                            <strong>Age:</strong> {calculateAge(beneficiary.dateOfBirth)} years
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Beneficiary Modal */}
              {editBeneficiaryId && (
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
                    borderRadius: '15px',
                    padding: '30px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                  }}>
                    <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Edit Beneficiary</h3>
                    <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>First Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={editBeneficiaryForm.fullName}
                          onChange={(e) => handleBeneficiaryChange(e, true)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Last Name *</label>
                        <input
                          type="text"
                          name="surname"
                          value={editBeneficiaryForm.surname}
                          onChange={(e) => handleBeneficiaryChange(e, true)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Date of Birth *</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={editBeneficiaryForm.dateOfBirth}
                          onChange={(e) => handleBeneficiaryChange(e, true)}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Relationship *</label>
                        <select
                          name="relation"
                          value={editBeneficiaryForm.relation}
                          onChange={(e) => handleBeneficiaryChange(e, true)}
                          required
                          style={inputStyle}
                        >
                          <option value="">Select relationship</option>
                          {RELATIONSHIP_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      {showCustomEdit && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>Specify Relationship *</label>
                          <input
                            type="text"
                            name="customRelation"
                            value={editBeneficiaryForm.customRelation}
                            onChange={(e) => handleBeneficiaryChange(e, true)}
                            required
                            style={inputStyle}
                            placeholder="Enter custom relationship"
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => resetBeneficiaryForm(true)}
                        style={secondaryButtonStyle}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={isSubmittingBeneficiary}
                        style={{
                          ...buttonStyle,
                          backgroundColor: isSubmittingBeneficiary ? '#6c757d' : '#28a745'
                        }}
                      >
                        {isSubmittingBeneficiary ? 'Updating...' : '💾 Update Beneficiary'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}