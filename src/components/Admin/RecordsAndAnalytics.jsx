import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../auth/AuthProvider';
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

export default function RecordsAndAnalytics() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const COLORS = ['#38b6ff', '#ff6384', '#4bc0c0', '#ffcd56', '#9966ff', '#ff9f40'];

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      try {
        const appointmentsQuery = query(collection(db, 'appointments'));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate?.() || doc.data().date
        }));
        console.log("Appointments data:", appointmentsData); // Debug log
        setAppointments(appointmentsData);

        const enquiriesQuery = query(collection(db, 'enquiries'));
        const enquiriesSnapshot = await getDocs(enquiriesQuery);
        const enquiriesData = enquiriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        console.log("Enquiries data:", enquiriesData); // Debug log
        setEnquiries(enquiriesData);

        const feedbackQuery = query(collection(db, 'patientFeedback'));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        console.log("Feedback data:", feedbackData); // Debug log
        setFeedback(feedbackData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const processAppointmentData = () => {
    const statusCount = {
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0
    };

    appointments.forEach(apt => {
      if (statusCount.hasOwnProperty(apt.status)) {
        statusCount[apt.status]++;
      }
    });

    const statusData = {
      labels: Object.keys(statusCount).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: COLORS,
          borderColor: COLORS.map(color => color + 'DD'),
          borderWidth: 1,
        },
      ],
    };

    const monthlyData = Array(12).fill(0).map((_, i) => ({
      name: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      appointments: 0
    }));

    appointments.forEach(apt => {
      if (apt.date) {
        const month = new Date(apt.date).getMonth();
        monthlyData[month].appointments++;
      }
    });

    const monthlyChartData = {
      labels: monthlyData.map(m => m.name),
      datasets: [
        {
          label: 'Appointments',
          data: monthlyData.map(m => m.appointments),
          backgroundColor: '#38b6ff',
        },
      ],
    };

    return { statusData, monthlyChartData };
  };

  const processEnquiryData = () => {
    const statusCount = {
      pending: 0,
      completed: 0
    };

    enquiries.forEach(enquiry => {
      const status = enquiry.status || 'pending';
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    const statusData = {
      labels: Object.keys(statusCount).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: [COLORS[0], COLORS[1]],
          borderColor: [COLORS[0] + 'DD', COLORS[1] + 'DD'],
          borderWidth: 1,
        },
      ],
    };

    const monthlyData = Array(12).fill(0).map((_, i) => ({
      name: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      enquiries: 0
    }));

    enquiries.forEach(enquiry => {
      const month = new Date(enquiry.timestamp).getMonth();
      monthlyData[month].enquiries++;
    });

    const monthlyChartData = {
      labels: monthlyData.map(m => m.name),
      datasets: [
        {
          label: 'Enquiries',
          data: monthlyData.map(m => m.enquiries),
          backgroundColor: '#ff6384',
        },
      ],
    };

    return { statusData, monthlyChartData };
  };

  const processFeedbackData = () => {
    const ratingCount = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    feedback.forEach(fb => {
      if (ratingCount.hasOwnProperty(fb.rating)) {
        ratingCount[fb.rating]++;
      }
    });

    const ratingData = {
      labels: Object.keys(ratingCount).map(key => `${key} Star${key > 1 ? 's' : ''}`),
      datasets: [
        {
          label: 'Number of Ratings',
          data: Object.values(ratingCount),
          backgroundColor: '#4bc0c0',
        },
      ],
    };

    const typeCount = {};
    feedback.forEach(fb => {
      const type = fb.feedbackType || 'General';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const typeData = {
      labels: Object.keys(typeCount),
      datasets: [
        {
          data: Object.values(typeCount),
          backgroundColor: COLORS,
          borderColor: COLORS.map(color => color + 'DD'),
          borderWidth: 1,
        },
      ],
    };

    return { ratingData, typeData };
  };

  const appointmentStatusData = processAppointmentData();
  const enquiryStatusData = processEnquiryData();
  const feedbackData = processFeedbackData();

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;

  const totalEnquiries = enquiries.length;
  const resolvedEnquiries = enquiries.filter(e => e.status === 'completed').length;
  const resolutionRate = totalEnquiries > 0 ? (resolvedEnquiries / totalEnquiries * 100).toFixed(1) : 0;

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const handleBackClick = () => {
    navigate('/admin');
  };

  const combinedMonthlyData = {
    labels: appointmentStatusData.monthlyChartData.labels,
    datasets: [
      {
        label: 'Appointments',
        data: appointmentStatusData.monthlyChartData.datasets[0].data,
        backgroundColor: '#38b6ff',
      },
      {
        label: 'Enquiries',
        data: enquiryStatusData.monthlyChartData.datasets[0].data,
        backgroundColor: '#ff6384',
      },
    ],
  };

  const correlationData = {
    labels: appointmentStatusData.monthlyChartData.labels,
    datasets: [
      {
        type: 'bar',
        label: 'Appointments',
        data: appointmentStatusData.monthlyChartData.datasets[0].data,
        backgroundColor: '#38b6ff',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Avg. Rating',
        data: appointmentStatusData.monthlyChartData.labels.map((_, idx) => {
          const monthFeedback = feedback.filter(fb =>
            new Date(fb.createdAt).getMonth() === idx
          );
          return monthFeedback.length > 0
            ? monthFeedback.reduce((sum, fb) => sum + fb.rating, 0) / monthFeedback.length
            : 0;
        }),
        borderColor: '#ff6384',
        backgroundColor: '#ff638422',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const correlationOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Appointments',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Average Rating',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Chart options with percentage labels
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
          return percentage > 5 ? `${percentage}%` : ''; // Only show percentage if slice is large enough
        },
        textAlign: 'center',
        anchor: 'center',
        align: 'center'
      }
    }
  };

  // Bar chart options with percentage tooltips
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
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#333',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return value > 0 ? `${percentage}%` : '';
        },
        anchor: 'end',
        align: 'top',
        offset: 4
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

  // Monthly trends chart options (no percentage labels due to multi-dataset complexity)
  const monthlyTrendsOptions = {
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
            // Calculate percentage of total for this month across all datasets
            const dataIndex = context.dataIndex;
            const chart = context.chart;
            const monthTotal = chart.data.datasets.reduce((sum, dataset) => {
              return sum + (dataset.data[dataIndex] || 0);
            }, 0);
            const percentage = monthTotal > 0 ? ((value / monthTotal) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}% of month total)`;
          }
        }
      },
      datalabels: {
        display: false // Disable for monthly trends due to complexity
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Feedback Rating'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 5
      }
    }
  };

  const containerStyle = {
    fontFamily: "'Inter', sans-serif",
    background: "#f0f4f8",
    minHeight: "100vh",
    padding: window.innerWidth <= 576 ? "10px" : "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const tableStyle = {
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "600px",
    borderCollapse: "collapse",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "20px",
  };

  const tableWrapperStyle = {
    overflowX: window.innerWidth <= 576 ? "auto" : "visible",
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "600px",
  };

  const thStyle = {
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    padding: window.innerWidth <= 576 ? "8px" : "12px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "1rem",
    fontWeight: "600",
    borderBottom: "1px solid #dee2e6",
  };

  const tdStyle = {
    padding: window.innerWidth <= 576 ? "8px" : "12px",
    borderBottom: "1px solid #dee2e6",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: window.innerWidth <= 576 ? "0.8rem" : "0.9rem",
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
    borderRadius: "50px",
    border: "none",
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    cursor: "pointer",
    fontSize: window.innerWidth <= 576 ? "0.85rem" : "0.95rem",
  };

  const chartContainerStyle = {
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: window.innerWidth <= 576 ? "10px" : "20px",
    marginBottom: "20px",
    width: "100%",
    maxWidth: window.innerWidth <= 576 ? "100%" : "600px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const chartStyle = {
    width: "100%",
    maxWidth: "500px",
    height: "300px",
    margin: "0 auto",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "50px" }}>
        <div style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", color: "#6c757d" }}>
          <div style={{ width: "3rem", height: "3rem", border: "5px solid #4a90e2", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
          <p style={{ marginTop: "10px" }}>Loading analytics data...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", justifyContent: "center", alignItems: "center", marginBottom: "20px", gap: "10px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h1 style={{ fontSize: window.innerWidth <= 576 ? "1.5rem" : "2rem", margin: 0 }}>
          🦷 Records & Analytics
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

      {/* Percentage Statistics Cards */}
      <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", gap: "15px", justifyContent: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px", flexWrap: "wrap" }}>
        <div style={{ background: "linear-gradient(135deg, #4a90e2, #34c759)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Appointment Success Rate</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{completionRate}%</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {completedAppointments} of {totalAppointments} completed
          </p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #17a2b8, #20c997)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Enquiry Resolution Rate</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{resolutionRate}%</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {resolvedEnquiries} of {totalEnquiries} resolved
          </p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #ffc107, #fd7e14)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Patient Satisfaction</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>
            {feedback.length > 0 ? ((feedback.filter(f => f.rating >= 4).length / feedback.length) * 100).toFixed(1) : 0}%
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {feedback.filter(f => f.rating >= 4).length} of {feedback.length} positive
          </p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #6f42c1, #e83e8c)", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px", flex: "1" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>Average Rating</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>{averageRating}/5</div>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
            {((averageRating / 5) * 100).toFixed(1)}% of maximum
          </p>
        </div>
      </div>

      {/* Enhanced KPI Table */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>Count</th>
              <th style={thStyle}>Percentage</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Total Appointments</td>
              <td style={tdStyle}>
                <span style={{ color: "#007bff", fontWeight: "bold" }}>{totalAppointments}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#28a745", fontWeight: "bold" }}>{completionRate}% Completed</span>
              </td>
              <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                  color: "white",
                  backgroundColor: completionRate >= 70 ? "#28a745" : "#ffc107",
                }}>
                  {completionRate >= 70 ? "Excellent" : "Needs Improvement"}
                </span>
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Patient Enquiries</td>
              <td style={tdStyle}>
                <span style={{ color: "#17a2b8", fontWeight: "bold" }}>{totalEnquiries}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#20c997", fontWeight: "bold" }}>{resolutionRate}% Resolved</span>
              </td>
              <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                  color: "white",
                  backgroundColor: resolutionRate >= 80 ? "#28a745" : "#ffc107",
                }}>
                  {resolutionRate >= 80 ? "Excellent" : "Good"}
                </span>
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Feedback Received</td>
              <td style={tdStyle}>
                <span style={{ color: "#ffc107", fontWeight: "bold" }}>{feedback.length}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#fd7e14", fontWeight: "bold" }}>
                  {feedback.length > 0 ? ((feedback.filter(f => f.rating >= 4).length / feedback.length) * 100).toFixed(1) : 0}% Positive
                </span>
              </td>
              <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                  color: "white",
                  backgroundColor: averageRating >= 4 ? "#28a745" : averageRating >= 3 ? "#ffc107" : "#dc3545",
                }}>
                  {averageRating >= 4 ? "Excellent" : averageRating >= 3 ? "Good" : "Needs Attention"}
                </span>
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>High Satisfaction (4-5★)</td>
              <td style={tdStyle}>
                <span style={{ color: "#28a745", fontWeight: "bold" }}>
                  {feedback.filter(f => f.rating >= 4).length}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#28a745", fontWeight: "bold" }}>
                  {feedback.length > 0 ? ((feedback.filter(f => f.rating >= 4).length / feedback.length) * 100).toFixed(1) : 0}% of Total
                </span>
              </td>
              <td style={{ ...tdStyle, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: window.innerWidth <= 576 ? "0.7rem" : "0.8rem",
                  color: "white",
                  backgroundColor: feedback.length > 0 && (feedback.filter(f => f.rating >= 4).length / feedback.length) >= 0.8 ? "#28a745" : "#ffc107",
                }}>
                  {feedback.length > 0 && (feedback.filter(f => f.rating >= 4).length / feedback.length) >= 0.8 ? "Excellent" : "Good"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Appointment and Enquiry Status Charts */}
      <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", gap: "20px", justifyContent: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
            Appointment Status Distribution
          </h5>
          <div style={chartStyle}>
            <Pie data={appointmentStatusData.statusData} options={pieChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Total: {totalAppointments} appointments</p>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "10px" }}>
              {appointmentStatusData.statusData.labels.map((label, index) => {
                const value = appointmentStatusData.statusData.datasets[0].data[index];
                const percentage = totalAppointments > 0 ? ((value / totalAppointments) * 100).toFixed(1) : 0;
                return (
                  <span key={label} style={{ fontSize: "0.8rem" }}>
                    <strong>{label}:</strong> {value} ({percentage}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
            Enquiry Status Distribution
          </h5>
          <div style={chartStyle}>
            <Pie data={enquiryStatusData.statusData} options={pieChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Total: {totalEnquiries} enquiries</p>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "10px" }}>
              {enquiryStatusData.statusData.labels.map((label, index) => {
                const value = enquiryStatusData.statusData.datasets[0].data[index];
                const percentage = totalEnquiries > 0 ? ((value / totalEnquiries) * 100).toFixed(1) : 0;
                return (
                  <span key={label} style={{ fontSize: "0.8rem" }}>
                    <strong>{label}:</strong> {value} ({percentage}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div style={{ ...chartContainerStyle, maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
          Monthly Trends (Appointments vs Enquiries)
        </h5>
        <div style={{ ...chartStyle, maxWidth: "1000px" }}>
          <Bar data={combinedMonthlyData} options={monthlyTrendsOptions} />
        </div>
        <div style={{ textAlign: "center", marginTop: "15px", fontSize: "0.9rem", color: "#6c757d" }}>
          <p><strong>Monthly Distribution:</strong> Hover over bars to see percentage of total volume</p>
        </div>
      </div>

      {/* Feedback Charts */}
      <div style={{ display: "flex", flexDirection: window.innerWidth <= 576 ? "column" : "row", gap: "20px", justifyContent: "center", marginBottom: "20px", width: "100%", maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
            Feedback Rating Distribution
          </h5>
          <div style={chartStyle}>
            <Bar data={feedbackData.ratingData} options={barChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Total: {feedback.length} feedback entries</p>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "5px" }}>
              {feedbackData.ratingData.labels.map((label, index) => {
                const value = feedbackData.ratingData.datasets[0].data[index];
                const percentage = feedback.length > 0 ? ((value / feedback.length) * 100).toFixed(1) : 0;
                return (
                  <span key={label} style={{ fontSize: "0.8rem" }}>
                    <strong>{label}⭐:</strong> {value} ({percentage}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div style={chartContainerStyle}>
          <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
            Feedback Type Distribution
          </h5>
          <div style={chartStyle}>
            <Pie data={feedbackData.typeData} options={pieChartOptions} />
          </div>
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}>
            <p>Total: {feedback.length} feedback entries</p>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "10px" }}>
              {feedbackData.typeData.labels.map((label, index) => {
                const value = feedbackData.typeData.datasets[0].data[index];
                const percentage = feedback.length > 0 ? ((value / feedback.length) * 100).toFixed(1) : 0;
                return (
                  <span key={label} style={{ fontSize: "0.8rem" }}>
                    <strong>{label}:</strong> {value} ({percentage}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Analysis */}
      <div style={{ ...chartContainerStyle, maxWidth: window.innerWidth <= 576 ? "100%" : "1200px" }}>
        <h5 style={{ textAlign: "center", fontSize: window.innerWidth <= 576 ? "1.2rem" : "1.5rem", marginBottom: "15px" }}>
          Correlation Analysis: Appointments vs Feedback Ratings
        </h5>
        <p style={{ textAlign: "center", color: "#6c757d", fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem", maxWidth: "800px", margin: "0 auto 15px" }}>
          This chart explores the relationship between the number of appointments and average feedback ratings per month.
          A positive correlation might indicate that busier months lead to better or worse patient experiences.
        </p>
        <div style={{ ...chartStyle, maxWidth: "1000px" }}>
          <Bar data={correlationData} options={correlationOptions} />
        </div>
        <div style={{ textAlign: "center", marginTop: "15px", fontSize: window.innerWidth <= 576 ? "0.9rem" : "1rem", maxWidth: "800px" }}>
          <h6 style={{ fontSize: window.innerWidth <= 576 ? "1rem" : "1.2rem", marginBottom: "10px" }}>Insights:</h6>
          <ul style={{ listStylePosition: "inside", padding: 0 }}>
            <li>Monitor months with high appointments but lower ratings - may indicate staff overwork</li>
            <li>Identify months with optimal balance of volume and satisfaction</li>
            <li>Use this data to plan staffing levels during peak periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
}