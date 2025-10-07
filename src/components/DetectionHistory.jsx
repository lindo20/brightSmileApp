import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import DetectionService from '../services/detectionService';
import './DetectionHistory.css';

const DetectionHistory = () => {
  const { currentUser } = useAuth();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadDetections = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [detectionsData, statsData] = await Promise.all([
          DetectionService.getUserDetections(currentUser.uid),
          DetectionService.getUserDetectionStats(currentUser.uid)
        ]);
        
        setDetections(detectionsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading detections:', error);
        setError('Failed to load detection history');
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#27ae60',
      'Medium': '#f39c12',
      'High': '#e74c3c',
      'Critical': '#8e44ad'
    };
    return colors[severity] || '#95a5a6';
  };

  const handleDetectionClick = (detection) => {
    setSelectedDetection(detection);
  };

  const closeModal = () => {
    setSelectedDetection(null);
  };

  if (!currentUser) {
    return (
      <div className="detection-history">
        <div className="login-required">
          <h2>🔐 Login Required</h2>
          <p>Please log in to view your detection history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="detection-history">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your detection history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-history">
      <div className="header">
        <h2>📊 Detection History</h2>
        <p>View your past X-ray analysis results</p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalDetections}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgCavityPercentage?.toFixed(1)}%</div>
              <div className="stat-label">Avg Cavity Coverage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgConfidence?.toFixed(1)}%</div>
              <div className="stat-label">Avg Confidence</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.recentScans}</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {detections.length === 0 ? (
        <div className="no-detections">
          <div className="empty-state">
            <div className="empty-icon">🦷</div>
            <h3>No Detection History</h3>
            <p>You haven't performed any X-ray analyses yet.</p>
            <p>Start by uploading an X-ray image for analysis!</p>
          </div>
        </div>
      ) : (
        <div className="detections-grid">
          {detections.map((detection) => (
            <div 
              key={detection.id} 
              className="detection-card"
              onClick={() => handleDetectionClick(detection)}
            >
              <div className="detection-header">
                <div className="detection-date">
                  {formatDate(detection.timestamp)}
                </div>
                <div 
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(detection.severity) }}
                >
                  {detection.severity}
                </div>
              </div>
              
              <div className="detection-metrics">
                <div className="metric">
                  <span className="metric-label">Cavity Coverage:</span>
                  <span className="metric-value">{detection.cavityPercentage?.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Confidence:</span>
                  <span className="metric-value">{detection.confidence?.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Cavities Found:</span>
                  <span className="metric-value">{detection.cavityCount || 0}</span>
                </div>
              </div>

              <div className="detection-footer">
                <span className="view-details">Click to view details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detection Detail Modal */}
      {selectedDetection && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detection Details</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>📅 Analysis Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedDetection.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Processing Time:</span>
                    <span className="value">{selectedDetection.processingTime}s</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Model Version:</span>
                    <span className="value">{selectedDetection.modelVersion}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>🦷 Detection Results</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Cavity Coverage:</span>
                    <span className="value">{selectedDetection.cavityPercentage?.toFixed(2)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Confidence Score:</span>
                    <span className="value">{selectedDetection.confidence?.toFixed(2)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Severity Level:</span>
                    <span 
                      className="value severity-tag"
                      style={{ 
                        backgroundColor: getSeverityColor(selectedDetection.severity),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {selectedDetection.severity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cavities Detected:</span>
                    <span className="value">{selectedDetection.cavityCount || 0}</span>
                  </div>
                </div>
              </div>

              {selectedDetection.recommendations && selectedDetection.recommendations.length > 0 && (
                <div className="detail-section">
                  <h4>💡 Recommendations</h4>
                  <ul className="recommendations-list">
                    {selectedDetection.recommendations.map((rec, index) => (
                      <li key={index} className="recommendation-item">
                        <strong>{rec.treatment}:</strong> {rec.description}
                        <span className={`priority priority-${rec.priority}`}>
                          ({rec.priority} priority)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionHistory;