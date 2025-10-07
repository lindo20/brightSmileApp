import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { signOut } from "firebase/auth";
import { auth } from '../firebase/config'
import { FaBars, FaTimes, FaTooth, FaUser, FaCalendar, FaComments, FaHistory, FaSignOutAlt, FaUsers, FaChartBar } from 'react-icons/fa';

export default function FileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  // New working sigout for sidebars
  const sign_out = async () =>{
    try{
      await signOut(auth);
      navigate('/welcome');
    }catch(err){
      console.error('Failed to log out', err);
      
    }
  }

  
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/welcome'); 
  //   } catch (error) {
  //     console.error('Failed to log out', error);
  //   }
  // };

  // Don't show sidebar on welcome, signin, or signup pages
  if (['/welcome', '/select-role', '/signin', '/reset', '/patient-signup', '/dentist-signup', '/admin-signup'].includes(location.pathname)) {
    return null;
  }

  // Define color theme based on your CSS
  const theme = {
    primary: '#4a90e2',       // Main blue from buttons
    secondary: '#34c759',     // Green from gradient
    lightBlue: '#e6f0fa',     // Light blue from hero icon
    background: '#f0f4f8',    // App background
    cardBackground: '#ffffff', // Card background
    textDark: '#1a3c34',      // Dark text
    textLight: '#ffffff',     // Light text
    accent: '#357abd',        // Darker blue for hover
    border: '#dee2e6',        // Border color
    hover: 'rgba(74, 144, 226, 0.1)', // Hover effect
  };

  // Patient sidebar items
  const patientItems = [
    { path: '/patient', label: 'Dashboard', icon: <FaTooth style={{ color: theme.primary }} /> },
    { path: '/patient/profile', label: 'Profile', icon: <FaUser style={{ color: theme.primary }} /> },
    { path: '/book-appointment', label: 'Book Appointment', icon: <FaCalendar style={{ color: theme.primary }} /> },
    { path: '/patient/appointments', label: 'Appointments Info', icon: <FaCalendar style={{ color: theme.primary }} /> },
    { path: '/patient/chat', label: 'Chat with Admin', icon: <FaComments style={{ color: theme.primary }} /> },
    { path: '/patient/feedback', label: 'Give Feedback', icon: <FaCalendar style={{ color: theme.primary }} /> },
  ];

  // Dentist sidebar items
  const dentistItems = [
    { path: '/dentist', label: 'Dashboard', icon: <FaTooth style={{ color: theme.primary }} /> },
    { path: '/dentist/appointments', label: 'Appointments Scheduling', icon: <FaCalendar style={{ color: theme.primary }} /> },
    { path: '/dentist/patients', label: 'Patient Profiles', icon: <FaUsers style={{ color: theme.primary }} /> },
    { path: '/dentist/charts', label: 'Dental Analytics', icon: <FaChartBar style={{ color: theme.primary }} /> },
    { path: '/dentist/caries-detection', label: 'Cavities Detection', icon: <FaTooth style={{ color: theme.primary }} /> },
  ];

  // Admin sidebar items
  const adminItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaTooth style={{ color: theme.primary }} /> },
    { path: '/admin/chat', label: 'Chat with Patients', icon: <FaComments style={{ color: theme.primary }} /> },
    { path: '/admin/appointments', label: 'Appointments', icon: <FaCalendar style={{ color: theme.primary }} /> },
    { path: '/admin/enquiries', label: 'Patient Enquiries', icon: <FaComments style={{ color: theme.primary }} /> },
    { path: '/admin/feedback', label: 'Feedback', icon: <FaComments style={{ color: theme.primary }} /> },
    { path: '/admin/reports', label: 'Records & Analytics', icon: <FaChartBar style={{ color: theme.primary }} /> },
    { path: '/admin/announcements', label: 'Manage Announcements', icon: <FaComments style={{ color: theme.primary }} /> },
    { path: '/admin/manage-users', label: 'Manage Users',icon: <FaUsers style={{ color: theme.primary }} /> },

  
  ];

  // Get the appropriate sidebar items based on user role
  const getSidebarItems = () => {
    switch (role) {
      case 'admin':
        return adminItems;
      case 'dentist':
        return dentistItems;
      case 'patient':
        return patientItems;
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle"
        style={{
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #4a90e2, #34c759)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '10px 15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          fontWeight: '600',
        }}
      >
        <FaBars size={18} style={{ marginRight: '8px' }} />
        Menu
      </button>

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className="file-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-280px',
          height: '100vh',
          width: '280px',
          backgroundColor: theme.cardBackground,
          color: theme.textDark,
          transition: 'left 0.3s ease',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Close button */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'transparent',
            color: theme.textDark,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%',
            padding: '5px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.hover;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <FaTimes size={20} />
        </button>

        {/* User info */}
        <div
          style={{
            padding: '25px 20px',
            borderBottom: `1px solid ${theme.border}`,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4a90e2, #34c759)',
            color: theme.textLight,
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: theme.textLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
              fontSize: '1.8rem',
              color: theme.primary,
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h4 style={{ 
            margin: '0 0 5px 0', 
            fontSize: '1.1rem',
            fontWeight: '600',
          }}>
            {currentUser?.displayName || currentUser?.email || 'User'}
          </h4>
          <p style={{ 
            margin: 0, 
            opacity: 0.9,
            textTransform: 'capitalize',
            fontSize: '0.9rem',
          }}>
            {role}
          </p>
        </div>

        {/* Navigation items */}
        <nav style={{ padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 20px',
                    color: location.pathname === item.path ? theme.primary : theme.textDark,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: location.pathname === item.path ? theme.hover : 'transparent',
                    borderLeft: location.pathname === item.path ? `4px solid ${theme.primary}` : '4px solid transparent',
                    fontWeight: location.pathname === item.path ? '600' : 'normal',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.hover;
                    e.target.style.color = theme.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = location.pathname === item.path ? theme.hover : 'transparent';
                    e.target.style.color = location.pathname === item.path ? theme.primary : theme.textDark;
                  }}
                >
                  <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Logout button */}
            <li>
              <div
                onClick={sign_out}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 20px',
                  color: theme.textDark,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  borderLeft: '4px solid transparent',
                  fontSize: '0.95rem',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.hover;
                  e.target.style.color = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.textDark;
                }}
              >
                <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                  <FaSignOutAlt style={{ color: theme.primary }} />
                </span>
                Logout
              </div>
            </li>
          </ul>
        </nav>

        {/* Footer with branding */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: theme.textDark,
          opacity: 0.7,
          fontSize: '0.8rem',
        }}>
          Dental Care System
        </div>
      </div>

      {/* Add some padding to the main content when sidebar is open */}
      <style>
        {`
          @media (min-width: 768px) {
            .app {
              margin-left: ${isOpen ? '280px' : '0'};
              transition: margin-left 0.3s ease;
            }
            
            .file-sidebar {
              left: 0;
            }
            
            .sidebar-toggle {
              display: none;
            }
            
            .sidebar-overlay {
              display: none;
            }
          }
          
          /* Ensure content is not overlapped on mobile */
          @media (max-width: 767px) {
            .app {
              padding-top: 60px;
            }
          }
        `}
      </style>
    </>
  );
}