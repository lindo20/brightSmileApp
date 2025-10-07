import React, { useState, useRef } from 'react';
import { useAuth } from './auth/AuthProvider';
import DetectionService from '../services/detectionService';
import './XRaySemanticSegmentation.css';

// Enhanced Detection Results Table Component
const DetectionResultsTable = ({ detections, getSeverityBadge }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('confidence');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'compact'

  // Helper function to get confidence value
  const getConfidence = (detection) => detection.confidence || detection.conf || 0;

  // Helper function to get severity level
  const getSeverityLevel = (detection) => {
    const conf = getConfidence(detection);
    return conf > 0.65 ? 'high' : conf > 0.55 ? 'medium' : 'low';
  };

  // Filter and sort detections
  const filteredDetections = detections
    .filter(detection => {
      const severityLevel = getSeverityLevel(detection);
      const matchesSeverity = filterSeverity === 'all' || severityLevel === filterSeverity;
      const matchesSearch = searchTerm === '' || 
        (detection.class || 'cavity').toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${detection.x || detection.location?.x || 'N/A'}, ${detection.y || detection.location?.y || 'N/A'}`.includes(searchTerm);
      return matchesSeverity && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'confidence':
          aValue = getConfidence(a);
          bValue = getConfidence(b);
          break;
        case 'x':
          aValue = a.x || a.location?.x || 0;
          bValue = b.x || b.location?.x || 0;
          break;
        case 'y':
          aValue = a.y || a.location?.y || 0;
          bValue = b.y || b.location?.y || 0;
          break;
        case 'severity':
          aValue = getSeverityLevel(a);
          bValue = getSeverityLevel(b);
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredDetections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDetections = filteredDetections.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="detection-results-table">
      <div className="table-header">
        <h3>🔍 Detection Results ({filteredDetections.length} of {detections.length})</h3>
        <div className="table-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📊 Table
            </button>
            <button 
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
            >
              📋 Compact
            </button>
          </div>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by type or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="severity-filter"
          >
            <option value="all">All Severities</option>
            <option value="high">High (≥65%)</option>
            <option value="medium">Medium (55-64%)</option>
            <option value="low">Low (&lt;55%)</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="items-per-page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="detections-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('type')} className="sortable">
                  Detection {getSortIcon('type')}
                </th>
                <th onClick={() => handleSort('confidence')} className="sortable">
                  Confidence {getSortIcon('confidence')}
                </th>
                <th onClick={() => handleSort('x')} className="sortable">
                  Location (X, Y) {getSortIcon('x')}
                </th>
                <th onClick={() => handleSort('severity')} className="sortable">
                  Severity {getSortIcon('severity')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDetections.map((detection, index) => (
                <tr key={startIndex + index} className="detection-row">
                  <td className="detection-type">
                    <span className="detection-icon">🦷</span>
                    <span className="detection-name">{detection.class || 'cavity'}</span>
                  </td>
                  <td className="confidence-cell">
                    <div className="confidence-bar-container">
                      <div 
                        className="confidence-bar" 
                        style={{ width: `${getConfidence(detection) * 100}%` }}
                      ></div>
                      <span className="confidence-text">
                        {(getConfidence(detection) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="location-cell">
                    <span className="coordinates">
                      {detection.x || detection.location?.x || 'N/A'}, {detection.y || detection.location?.y || 'N/A'}
                    </span>
                  </td>
                  <td className="severity-cell">
                    {getSeverityBadge(
                      getConfidence(detection) > 0.65 ? 'severe' :
                      getConfidence(detection) > 0.55 ? 'moderate' : 'mild'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="compact-view">
          {paginatedDetections.map((detection, index) => (
            <div key={startIndex + index} className="compact-detection-card">
              <div className="compact-header">
                <span className="detection-icon">🦷</span>
                <span className="detection-name">{detection.class || 'cavity'}</span>
                <span className="confidence-badge">
                  {(getConfidence(detection) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="compact-details">
                <span className="location">📍 {detection.x || detection.location?.x || 'N/A'}, {detection.y || detection.location?.y || 'N/A'}</span>
                {getSeverityBadge(
                  getConfidence(detection) > 0.65 ? 'severe' :
                  getConfidence(detection) > 0.55 ? 'moderate' : 'mild'
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ⏮️ First
          </button>
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ⬅️ Prev
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next ➡️
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Last ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

const XRaySemanticSegmentation = () => {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      setResults(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    setSaveStatus(null);
    
    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // Add user information if available
      if (currentUser) {
        formData.append('userId', currentUser.uid);
        formData.append('userRole', currentUser.role || 'patient');
      }
      
      // Call the predict-xray API endpoint (which includes Firebase integration)
      const response = await fetch('http://localhost:5000/api/v1/predict-xray', {
        method: 'POST',
        body: formData,
        headers: currentUser ? {
          'X-User-ID': currentUser.uid,
          'X-User-Role': currentUser.role || 'patient'
        } : {}
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      
      // Check if data was saved to Firebase
      if (data.firebaseDocId) {
        setSaveStatus('saved');
        console.log('Detection results saved to Firebase with ID:', data.firebaseDocId);
      } else if (currentUser) {
        setSaveStatus('save_failed');
        console.warn('Failed to save detection results to Firebase');
      }
      
    } catch (err) {
      console.error('X-ray analysis error:', err);
      setError(`Failed to analyze X-ray image: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSave = async () => {
    if (!results || !currentUser) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Prepare image metadata
      const imageMetadata = {
        fileName: selectedImage?.name || 'unknown',
        fileSize: selectedImage?.size || 0,
        imageType: 'dental_xray'
      };
      
      // Save to Firebase using the detection service
      const docId = await DetectionService.saveDetectionResults(
        results,
        currentUser.uid,
        currentUser.role || 'patient'
      );
      
      if (docId) {
        setSaveStatus('saved');
        console.log('Detection results manually saved with ID:', docId);
      } else {
        setSaveStatus('save_failed');
      }
      
    } catch (error) {
      console.error('Manual save error:', error);
      setSaveStatus('save_failed');
    } finally {
      setIsSaving(false);
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className="save-status success">
            ✅ Results saved to your history
          </div>
        );
      case 'save_failed':
        return (
          <div className="save-status error">
            ❌ Failed to save results
          </div>
        );
      default:
        return null;
    }
  };

  const getClassColor = (className) => {
    const colors = {
      cavity: '#FF4757',
      filling: '#2ED573',
      crown: '#3742FA',
      root_canal: '#FFA502',
      healthy_tooth: '#747d8c'
    };
    return colors[className] || '#747d8c';
  };

  const getSeverityBadge = (severity) => {
    const severityColors = {
      mild: '#34c759',
      moderate: '#4a90e2',
      severe: '#ff6b6b',
      none: '#6c757d'
    };
    
    return (
      <span 
        className="severity-badge"
        style={{ 
          background: `linear-gradient(135deg, ${severityColors[severity] || '#6c757d'}, ${severityColors[severity] || '#6c757d'}dd)`,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.8em',
          fontWeight: '600',
          textTransform: 'uppercase',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {severity}
      </span>
    );
  };

  return (
    <div className="xray-semantic-segmentation">
      <div className="header">
        <div className="flex items-center justify-between mb-4">
          <h2>🦷 X-Ray Semantic Segmentation</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-600 font-medium">Semantic Model v2.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">AI Model Active</span>
            </div>
          </div>
        </div>
        <p>Advanced pixel-level semantic segmentation of dental cavity regions</p>
      </div>

      <div className="upload-section">
        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="X-ray preview" className="image-preview" />
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📸</div>
              <p>Click to upload X-ray image</p>
              <p className="upload-hint">Supports JPEG, PNG, DICOM formats</p>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.dcm"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className="analyze-button"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            'Run Semantic Segmentation'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="model-info">
            <h3>🤖 Semantic Model Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Model Name:</span>
                <span className="value">{results.model_info.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Version:</span>
                <span className="value">{results.model_info.version}</span>
              </div>
              <div className="info-item">
                <span className="label">Architecture:</span>
                <span className="value">{results.model_info.architecture}</span>
              </div>
              <div className="info-item">
                <span className="label">Framework:</span>
                <span className="value">{results.model_info.framework}</span>
              </div>
              <div className="info-item">
                <span className="label">Classes:</span>
                <span className="value">{results.model_info.classes.join(', ')}</span>
              </div>
              <div className="info-item">
                <span className="label">Processing Time:</span>
                <span className="value">{results.processing_time}s</span>
              </div>
            </div>
          </div>

          <div className="segmentation-results">
            <h3>🎯 Semantic Segmentation Results</h3>
            <div className="segmentation-grid">
              <div className="segmentation-card">
                <div className="segmentation-header">
                  <span className="metric-title">Cavity Coverage</span>
                </div>
                <div className="metric-value">
                  <span className="percentage">{results.segmentation.cavity_percentage.toFixed(1)}%</span>
                  <span className="description">of image area</span>
                </div>
              </div>
              
              <div className="segmentation-card">
                <div className="segmentation-header">
                  <span className="metric-title">Cavity Regions</span>
                </div>
                <div className="metric-value">
                  <span className="count">{results.segmentation.num_cavities}</span>
                  <span className="description">detected regions</span>
                </div>
              </div>
              
              <div className="segmentation-card">
                <div className="segmentation-header">
                  <span className="metric-title">Confidence</span>
                </div>
                <div className="metric-value">
                  <span className="confidence">{(results.segmentation.confidence_score * 100).toFixed(1)}%</span>
                  <span className="description">model confidence</span>
                </div>
              </div>
            </div>

            {results.segmentation.mask_base64 && (
              <div className="mask-display">
                <h4>🎨 Segmentation Mask</h4>
                <img 
                  src={`data:image/png;base64,${results.segmentation.mask_base64}`} 
                  alt="Segmentation mask" 
                  className="segmentation-mask"
                />
              </div>
            )}
          </div>

          {/* Enhanced Detection Results Table with Pagination and Filtering */}
          {results.detections && results.detections.length > 0 && (
            <DetectionResultsTable 
              detections={results.detections} 
              getSeverityBadge={getSeverityBadge}
            />
          )}

          <div className="clinical-analysis">
            <h3>🏥 Clinical Analysis</h3>
            
            {/* Overall Severity and Risk Score - Prominent Display */}
            <div className="severity-risk-section">
              <div className="overall-severity">
                <h4>Overall Severity</h4>
                <div 
                  className="severity-display"
                  style={{
                    backgroundColor: results.analysis?.severity_level === 'severe' ? '#FF4757' :
                                   results.analysis?.severity_level === 'moderate' ? '#FFA502' :
                                   results.analysis?.severity_level === 'mild' ? '#F39C12' : '#2ED573',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                  }}
                >
                  {results.analysis?.severity_level || 'Unknown'}
                </div>
              </div>
              
              <div className="risk-score">
                <h4>Risk Score</h4>
                <div className="risk-score-display">
                  <span className="risk-number">
                    {results.analysis?.severity_level === 'severe' ? '8-10' :
                     results.analysis?.severity_level === 'moderate' ? '5-7' :
                     results.analysis?.severity_level === 'mild' ? '2-4' : '0-1'}
                  </span>
                  <span className="risk-total">/10</span>
                  <div className="risk-meaning">
                    {results.analysis?.severity_level === 'severe' ? 'Immediate attention required' :
                     results.analysis?.severity_level === 'moderate' ? 'Treatment needed soon' :
                     results.analysis?.severity_level === 'mild' ? 'Monitor and maintain hygiene' : 'Good oral health'}
                  </div>
                </div>
              </div>
            </div>

            <div className="analysis-summary">
              <div className="summary-item">
                <span className="count">{results.analysis?.detected_cavity_regions || 0}</span>
                <span className="label">Cavities</span>
              </div>
              <div className="summary-item">
                <span className="count">{results.analysis?.total_cavity_area_percentage?.toFixed(1) || '0.0'}%</span>
                <span className="label">Coverage</span>
              </div>
              <div className="summary-item">
                <span className="count">{((results.analysis?.confidence_score || 0) * 100).toFixed(0)}%</span>
                <span className="label">Confidence</span>
              </div>
            </div>

            <div className="urgency-section">
              <span className="urgency-label">Priority Level:</span>
              <span 
                className="urgency-badge"
                style={{
                  backgroundColor: results.analysis?.priority === 'urgent' ? '#FF4757' :
                                 results.analysis?.priority === 'high' ? '#FFA502' :
                                 results.analysis?.priority === 'medium' ? '#F39C12' : '#2ED573'
                }}
              >
                {results.analysis?.priority || 'low'}
              </span>
            </div>

            {results.analysis?.recommendations && results.analysis.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>💡 Treatment Recommendations:</h4>
                <ul>
                  {results.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      <span className="recommendation-text">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.analysis?.clinical_notes && (
              <div className="clinical-notes">
                <h4>📋 Clinical Notes:</h4>
                <p className="clinical-notes-text">{results.analysis.clinical_notes}</p>
              </div>
            )}
          </div>

          <div className="segmentation-features">
            <h3>🎯 Semantic Segmentation Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Pixel-level accuracy</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <span className="feature-text">Dense semantic masks</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Coverage analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏥</span>
                <span className="feature-text">Clinical-grade precision</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Real-time processing</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🧠</span>
                <span className="feature-text">U-Net architecture</span>
              </div>
            </div>
          </div>

          {/* Save Status and Manual Save */}
          <div className="save-section">
            {getSaveStatusMessage()}
            
            {currentUser && saveStatus !== 'saved' && (
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 Save to History
                  </>
                )}
              </button>
            )}
            
            {!currentUser && (
              <div className="login-prompt">
                <p>🔐 Please log in to save your detection results</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default XRaySemanticSegmentation;