import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function DentalCharts() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [treatmentsData, setTreatmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    newPatients: 0,
    revenue: 0
  });

  const COLORS = ['#38b6ff', '#ff6384', '#4bc0c0', '#ffcd56', '#9966ff', '#ff9f40'];

  useEffect(() => {
    if (!currentUser?.uid) return;
    fetchData();
  }, [currentUser, timeRange]);

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = appointmentsData.filter(appointment => 
        appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.treatmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(appointmentsData);
    }
  }, [searchTerm, appointmentsData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('dentistId', '==', currentUser.uid)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      // Fetch patients
      const patientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'patient')
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      // Filter data based on time range
      const now = new Date();
      const filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.createdAt;
        switch (timeRange) {
          case 'week':
            return appointmentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return appointmentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'quarter':
            return appointmentDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          case 'year':
            return appointmentDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });

      setAppointmentsData(filteredAppointments);
      setPatientsData(patients);
      
      // Calculate statistics
      const totalAppointments = filteredAppointments.length;
      const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
      const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending').length;
      const totalPatients = patients.length;
      const newPatients = patients.filter(p => {
        const patientDate = p.createdAt;
        switch (timeRange) {
          case 'week':
            return patientDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return patientDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'quarter':
            return patientDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          case 'year':
            return patientDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      }).length;

      setStats({
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalPatients,
        newPatients,
        revenue: completedAppointments * 150 // Estimated revenue
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = () => {
    // Appointment Status Data
    const statusData = {
      labels: ['Completed', 'Pending', 'Cancelled'],
      datasets: [{
        data: [
          stats.completedAppointments,
          stats.pendingAppointments,
          stats.totalAppointments - stats.completedAppointments - stats.pendingAppointments
        ],
        backgroundColor: COLORS.slice(0, 3),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Monthly Appointments Data
    const monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Appointments',
        data: Array.from({ length: 12 }, (_, i) => {
          return appointmentsData.filter(appointment => 
            appointment.createdAt.getMonth() === i
          ).length;
        }),
        backgroundColor: '#38b6ff',
        borderColor: '#38b6ff',
        borderWidth: 2
      }]
    };

    // Treatment Types Data
    const treatmentTypes = appointmentsData.reduce((acc, appointment) => {
      const type = appointment.treatmentType || 'General Checkup';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const treatmentData = {
      labels: Object.keys(treatmentTypes),
      datasets: [{
        label: 'Treatments',
        data: Object.values(treatmentTypes),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return { statusData, monthlyData, treatmentData };
  };

  const { statusData, monthlyData, treatmentData } = processChartData();

  // Chart options
  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : '';
        }
      }
    }
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      }
    }
  };

  const handleBackClick = () => {
    navigate('/dentist');
  };

  // Styling
  const containerStyle = {
    fontFamily: "'Inter', sans-serif",
    background: "#f0f4f8",
    minHeight: "100vh",
    padding: window.innerWidth <= 576 ? "10px" : "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const searchContainerStyle = {
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
  };

  const searchInputStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "12px 20px",
    fontSize: "1rem",
    border: "2px solid #e1e5e9",
    borderRadius: "25px",
    outline: "none",
    transition: "all 0.3s ease",
    background: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const selectStyle = {
    padding: window.innerWidth <= 576 ? "6px" : "8px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem",
    width: window.innerWidth <= 576 ? "120px" : "150px",
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

  const chartContainerStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: window.innerWidth <= 576 ? "100%" : "300px",
    maxWidth: window.innerWidth <= 576 ? "100%" : "500px",
  };

  const chartStyle = {
    height: "300px",
    width: "100%",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem", color: "#6c757d" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "4px solid #f3f3f3", 
            borderTop: "4px solid #4a90e2", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          Loading dental charts...
        </div>
      </div>
    );
  }

  const completionRate = stats.totalAppointments > 0 ? 
    ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1) : 0;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        flexDirection: window.innerWidth <= 576 ? "column" : "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
        gap: "10px", 
        width: "100%", 
        maxWidth: "1200px" 
      }}>
        <h1 style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", margin: 0 }}>
          📊 Dental Practice Analytics
        </h1>
        <div style={{ display: "flex", gap: "10px", flexDirection: window.innerWidth <= 576 ? "column" : "row", alignItems: "center" }}>
          <select
            style={selectStyle}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
        </div>
      </div>

      {/* Search Bar */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="🔍 Search appointments, treatments, or patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: "flex", 
        flexDirection: window.innerWidth <= 576 ? "column" : "row", 
        gap: "15px", 
        justifyContent: "center", 
        marginBottom: "20px", 
        width: "100%", 
        maxWidth: "1200px", 
        flexWrap: "wrap" 
      }}>
        <div style={{ 
          background: "linear-gradient(135deg, #4a90e2, #34c759)", 
          color: "white", 
          padding: "20px", 
          borderRadius: "12px", 
          textAlign: "center", 
          minWidth: "200px", 
          flex: "1" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Total Appointments</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{stats.totalAppointments}</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {completionRate}% completion rate
          </p>
        </div>
        
        <div style={{ 
          background: "linear-gradient(135deg, #17a2b8, #20c997)", 
          color: "white", 
          padding: "20px", 
          borderRadius: "12px", 
          textAlign: "center", 
          minWidth: "200px", 
          flex: "1" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Total Patients</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{stats.totalPatients}</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {stats.newPatients} new this period
          </p>
        </div>
        
        <div style={{ 
          background: "linear-gradient(135deg, #fd7e14, #e83e8c)", 
          color: "white", 
          padding: "20px", 
          borderRadius: "12px", 
          textAlign: "center", 
          minWidth: "200px", 
          flex: "1" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Estimated Revenue</h4>
           <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>R{stats.revenue}</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            From {stats.completedAppointments} completed appointments
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: "flex", 
        flexDirection: window.innerWidth <= 576 ? "column" : "row", 
        gap: "20px", 
        justifyContent: "center", 
        marginBottom: "20px", 
        width: "100%", 
        maxWidth: "1200px" 
      }}>
        {/* Appointment Status Chart */}
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "15px", color: "#2c3e50" }}>
            Appointment Status Distribution
          </h5>
          <div style={chartStyle}>
            <Pie data={statusData} options={pieChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Total: {stats.totalAppointments} appointments</p>
          </div>
        </div>

        {/* Treatment Types Chart */}
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "15px", color: "#2c3e50" }}>
            Treatment Types Distribution
          </h5>
          <div style={chartStyle}>
            <Pie data={treatmentData} options={pieChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Most common treatments</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div style={{ 
        ...chartContainerStyle, 
        maxWidth: "1200px", 
        width: "100%" 
      }}>
        <h5 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "15px", color: "#2c3e50" }}>
          Monthly Appointment Trends
        </h5>
        <div style={{ ...chartStyle, height: "400px" }}>
          <Bar data={monthlyData} options={barChartOptions} />
        </div>
        <div style={{ textAlign: "center", marginTop: "15px", fontSize: "0.9rem", color: "#6c757d" }}>
          <p><strong>Monthly Distribution:</strong> Track appointment volume throughout the year</p>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div style={{ 
          ...chartContainerStyle, 
          maxWidth: "1200px", 
          width: "100%",
          marginTop: "20px"
        }}>
          <h5 style={{ fontSize: "1.3rem", marginBottom: "15px", color: "#2c3e50" }}>
            Search Results ({filteredData.length} found)
          </h5>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {filteredData.length > 0 ? (
              filteredData.map((appointment, index) => (
                <div key={index} style={{
                  padding: "10px",
                  borderBottom: "1px solid #e9ecef",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <strong>{appointment.patientName || 'Unknown Patient'}</strong>
                    <br />
                    <span style={{ color: "#6c757d" }}>
                      {appointment.treatmentType || 'General Checkup'} - {appointment.status || 'pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                    {appointment.createdAt?.toLocaleDateString() || 'No date'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
                No appointments found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:focus {
            border-color: #4a90e2 !important;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4) !important;
          }
        `}
      </style>
    </div>
  );
}
