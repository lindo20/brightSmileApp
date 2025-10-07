// X-Ray Dental Cavity Detection API Integration
// Add this to your React component

// Configuration - Update these URLs when you deploy your API
const XRAY_MODEL_URL = "YOUR_NGROK_URL/detect";
const XRAY_HEALTH_URL = "YOUR_NGROK_URL/health";
const XRAY_MODEL_INFO_URL = "YOUR_NGROK_URL/model-info";

// Function to detect cavities in X-ray images
const detectXRayCavities = async (imageFile, confidence = 0.25) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('confidence', confidence);
    formData.append('iou_threshold', 0.45);
    
    const response = await fetch(XRAY_MODEL_URL, {
      method: 'POST',
      body: formData,
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      predictions: result.predictions || [],
      clinicalAnalysis: result.clinical_analysis || {},
      processingTime: result.processing_time || 0,
      modelInfo: result.model_info || {}
    };
  } catch (error) {
    console.error('X-ray detection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to check X-ray API health
const checkXRayApiHealth = async () => {
  try {
    const response = await fetch(XRAY_HEALTH_URL);
    return response.ok;
  } catch (error) {
    console.error('X-ray API health check failed:', error);
    return false;
  }
};

// Function to get X-ray model information
const getXRayModelInfo = async () => {
  try {
    const response = await fetch(XRAY_MODEL_INFO_URL);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch X-ray model info:', error);
    return null;
  }
};

// React Hook for X-ray detection
const useXRayDetection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const detectCavities = async (imageFile, confidence = 0.25) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detectionResult = await detectXRayCavities(imageFile, confidence);
      
      if (detectionResult.success) {
        setResult(detectionResult);
      } else {
        setError(detectionResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    detectCavities,
    isLoading,
    result,
    error,
    reset
  };
};

// Clinical Analysis Component
const ClinicalAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'immediate': return '#FF4757';
      case 'soon': return '#FFA502';
      case 'routine': return '#2ED573';
      default: return '#747d8c';
    }
  };

  return (
    <div className="clinical-analysis">
      <h3>🏥 Clinical Analysis</h3>
      
      <div className="findings">
        <div className="finding-item">
          <span className="label">Cavities Detected:</span>
          <span className="value">{analysis.cavity_count || 0}</span>
        </div>
        
        <div className="finding-item">
          <span className="label">Fillings Found:</span>
          <span className="value">{analysis.filling_count || 0}</span>
        </div>
        
        <div className="finding-item">
          <span className="label">Severity Score:</span>
          <span className="value">{analysis.severity_score?.toFixed(1) || '0.0'}/10</span>
        </div>
        
        <div className="urgency-indicator">
          <span className="label">Urgency Level:</span>
          <span 
            className="urgency-badge"
            style={{ 
              backgroundColor: getUrgencyColor(analysis.urgency),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              textTransform: 'capitalize'
            }}
          >
            {analysis.urgency || 'Unknown'}
          </span>
        </div>
      </div>

      {analysis.urgency_message && (
        <div className="urgency-message">
          <p><strong>Recommendation:</strong> {analysis.urgency_message}</p>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="treatment-recommendations">
          <h4>Treatment Recommendations:</h4>
          <ul>
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>
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
  );
};

// X-ray Detection Component
const XRayDetection = () => {
  const { detectCavities, isLoading, result, error, reset } = useXRayDetection();
  const [selectedFile, setSelectedFile] = useState(null);
  const [confidence, setConfidence] = useState(0.25);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      reset();
    }
  };

  const handleDetection = async () => {
    if (!selectedFile) return;
    await detectCavities(selectedFile, confidence);
  };

  return (
    <div className="xray-detection">
      <h2>🦷 X-Ray Dental Cavity Detection</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*,.dcm"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
        
        <div className="confidence-slider">
          <label>Confidence Threshold: {confidence}</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={handleDetection}
          disabled={!selectedFile || isLoading}
          className="detect-button"
        >
          {isLoading ? 'Analyzing...' : 'Detect Cavities'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="results-section">
          <div className="detection-summary">
            <h3>🔍 Detection Results</h3>
            <p>Processing Time: {result.processingTime?.toFixed(3)}s</p>
            <p>Detections Found: {result.predictions?.length || 0}</p>
          </div>

          <ClinicalAnalysis analysis={result.clinicalAnalysis} />

          {result.predictions && result.predictions.length > 0 && (
            <div className="predictions-list">
              <h4>Detailed Findings:</h4>
              <ul>
                {result.predictions.map((pred, index) => (
                  <li key={index}>
                    <strong>{pred.class}</strong>: {(pred.confidence * 100).toFixed(1)}% confidence
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { 
  detectXRayCavities, 
  checkXRayApiHealth, 
  getXRayModelInfo,
  useXRayDetection,
  ClinicalAnalysis,
  XRayDetection
};