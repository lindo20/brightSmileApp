// // import React from 'react'

// // function Caries_detection() {
// //   return (
// //     <div>
// //       Cariesssssssss
// //     </div>
// //   )
// // }

// // export default Caries_detection

// // import React, { useState, useRef, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';

// // const CariesDetection = () => {
// //   const navigate = useNavigate();
// //   const fileInputRef = useRef(null);
// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
  
// //   const [imagePreview, setImagePreview] = useState(null);
// //   const [predictions, setPredictions] = useState(null);
// //   const [isWebcamActive, setIsWebcamActive] = useState(false);
// //   const [imageUrl, setImageUrl] = useState('');
// //   const [isLoading, setIsLoading] = useState(false);
  
// //   // Threshold controls
// //   const [confidenceThreshold, setConfidenceThreshold] = useState(50);
// //   const [overlapThreshold, setOverlapThreshold] = useState(50);
// //   const [opacityThreshold, setOpacityThreshold] = useState(75);
// //   const [labelMode, setLabelMode] = useState('normal');

// //   // Mock data - replace with actual API call
// //   const mockPredictions = {
// //     predictions: [
// //       {
// //         "x": 604.5, "y": 779, "width": 151, "height": 262,
// //         "confidence": 0.815, "class": "normal", "class_id": 1
// //       },
// //       {
// //         "x": 761, "y": 777.5, "width": 210, "height": 271,
// //         "confidence": 0.805, "class": "normal", "class_id": 1
// //       },
// //       {
// //         "x": 1082, "y": 581.5, "width": 272, "height": 249,
// //         "confidence": 0.738, "class": "cavity", "class_id": 0
// //       },
// //       {
// //         "x": 828, "y": 535, "width": 246, "height": 272,
// //         "confidence": 0.698, "class": "cavity", "class_id": 0
// //       }
// //     ],
// //     mAP: { all: 75.0, cavity: 76.0, normal: 75.0 }
// //   };

// //   // Handle file upload
// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         setImagePreview(event.target.result);
// //         analyzeImage(event.target.result);
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   // Handle drag and drop
// //   const handleDrop = (e) => {
// //     e.preventDefault();
// //     const file = e.dataTransfer.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         setImagePreview(event.target.result);
// //         analyzeImage(event.target.result);
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   // Analyze image (mock implementation)
// //   const analyzeImage = (imageSrc) => {
// //     setIsLoading(true);
// //     // Simulate API call delay
// //     setTimeout(() => {
// //       setPredictions(mockPredictions);
// //       drawBoundingBoxes(imageSrc, mockPredictions.predictions);
// //       setIsLoading(false);
// //     }, 1500);
// //   };

// //   // Draw bounding boxes on canvas
// //   const drawBoundingBoxes = (imageSrc, boxes) => {
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const img = new Image();
    
// //     img.onload = () => {
// //       canvas.width = img.width;
// //       canvas.height = img.height;
// //       ctx.drawImage(img, 0, 0);
      
// //       boxes.forEach(box => {
// //         if (box.confidence * 100 >= confidenceThreshold) {
// //           const color = box.class === 'cavity' ? '#ff0000' : '#00ff00';
// //           ctx.strokeStyle = color;
// //           ctx.lineWidth = 2;
// //           ctx.strokeRect(box.x, box.y, box.width, box.height);
          
// //           // Draw label
// //           if (labelMode !== 'minimal') {
// //             ctx.fillStyle = color;
// //             ctx.fillRect(box.x, box.y - 20, 100, 20);
// //             ctx.fillStyle = '#ffffff';
// //             ctx.font = '12px Arial';
// //             ctx.fillText(
// //               `${box.class} ${Math.round(box.confidence * 100)}%`, 
// //               box.x + 5, 
// //               box.y - 5
// //             );
// //           }
// //         }
// //       });
// //     };
// //     img.src = imageSrc;
// //   };

// //   // Handle webcam
// //   const toggleWebcam = async () => {
// //     if (isWebcamActive) {
// //       if (videoRef.current.srcObject) {
// //         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
// //       }
// //       setIsWebcamActive(false);
// //     } else {
// //       try {
// //         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //         videoRef.current.srcObject = stream;
// //         setIsWebcamActive(true);
// //       } catch (err) {
// //         console.error("Error accessing webcam:", err);
// //       }
// //     }
// //   };

// //   // Capture from webcam
// //   const captureFromWebcam = () => {
// //     const canvas = document.createElement('canvas');
// //     canvas.width = videoRef.current.videoWidth;
// //     canvas.height = videoRef.current.videoHeight;
// //     const ctx = canvas.getContext('2d');
// //     ctx.drawImage(videoRef.current, 0, 0);
    
// //     const imageSrc = canvas.toDataURL('image/png');
// //     setImagePreview(imageSrc);
// //     analyzeImage(imageSrc);
// //     toggleWebcam(); // Turn off webcam after capture
// //   };

// //   // Handle URL image
// //   const handleUrlImage = () => {
// //     if (imageUrl) {
// //       setIsLoading(true);
// //       setImagePreview(imageUrl);
// //       analyzeImage(imageUrl);
// //     }
// //   };

// //   // Update canvas when thresholds change
// //   useEffect(() => {
// //     if (imagePreview && predictions) {
// //       drawBoundingBoxes(imagePreview, predictions.predictions);
// //     }
// //   }, [confidenceThreshold, overlapThreshold, opacityThreshold, labelMode]);

// //   return (
// //     <div className="container py-4">
// //       <div className="card shadow-lg">
// //         <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
// //           <h2 className="mb-0">
// //             <i className="bi bi-robot me-2"></i>
// //             Cavity Detection AI
// //           </h2>
// //           <button 
// //             onClick={() => navigate('/dentist')}
// //             className="btn btn-light btn-sm"
// //           >
// //             <i className="bi bi-arrow-left me-1"></i>
// //             Back to Dashboard
// //           </button>
// //         </div>
        
// //         <div className="card-body">
// //           <div className="row">
// //             {/* Left Column - Controls */}
// //             <div className="col-md-4">
// //               <div className="mb-4">
// //                 <h4>Preview Model</h4>
// //                 <div className="d-flex justify-content-between mb-3">
// //                   <button className="btn btn-outline-primary btn-sm">
// //                     Samples from Test Set
// //                   </button>
// //                   <button className="btn btn-outline-primary btn-sm">
// //                     View Test Set
// //                   </button>
// //                 </div>
// //               </div>

// //               <div 
// //                 className="border rounded p-4 text-center mb-4"
// //                 onDrop={handleDrop}
// //                 onDragOver={(e) => e.preventDefault()}
// //                 onClick={() => fileInputRef.current.click()}
// //                 style={{ 
// //                   minHeight: '200px', 
// //                   cursor: 'pointer',
// //                   background: imagePreview ? 'transparent' : '#f8f9fa'
// //                 }}
// //               >
// //                 <input 
// //                   type="file" 
// //                   ref={fileInputRef}
// //                   className="d-none" 
// //                   accept="image/*" 
// //                   onChange={handleFileChange}
// //                 />
                
// //                 {isLoading ? (
// //                   <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
// //                     <div className="spinner-border text-primary" role="status">
// //                       <span className="visually-hidden">Loading...</span>
// //                     </div>
// //                   </div>
// //                 ) : imagePreview ? (
// //                   <img 
// //                     src={imagePreview} 
// //                     alt="Preview" 
// //                     className="img-fluid mb-2"
// //                     style={{ maxHeight: '150px' }}
// //                   />
// //                 ) : (
// //                   <>
// //                     <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
// //                     <p className="mb-1">Upload Image or Video File</p>
// //                     <p className="text-muted small">Drop file here or</p>
// //                     <button className="btn btn-primary btn-sm">
// //                       Select File
// //                     </button>
// //                   </>
// //                 )}
// //               </div>

// //               <div className="mb-3">
// //                 <label className="form-label">Image URL</label>
// //                 <div className="input-group">
// //                   <input 
// //                     type="text" 
// //                     className="form-control" 
// //                     placeholder="Paste image URL"
// //                     value={imageUrl}
// //                     onChange={(e) => setImageUrl(e.target.value)}
// //                   />
// //                   <button 
// //                     className="btn btn-outline-secondary"
// //                     onClick={handleUrlImage}
// //                   >
// //                     Load
// //                   </button>
// //                 </div>
// //               </div>

// //               <div className="d-grid gap-2 mb-4">
// //                 <button 
// //                   className={`btn ${isWebcamActive ? 'btn-danger' : 'btn-outline-primary'}`}
// //                   onClick={toggleWebcam}
// //                 >
// //                   {isWebcamActive ? 'Stop Webcam' : 'Try With Webcam'}
// //                 </button>
// //                 <button className="btn btn-outline-primary">
// //                   Try On My Machine
// //                 </button>
// //               </div>

// //               {isWebcamActive && (
// //                 <div className="mb-3 text-center">
// //                   <video 
// //                     ref={videoRef} 
// //                     autoPlay 
// //                     playsInline
// //                     style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px' }}
// //                   ></video>
// //                   <button 
// //                     className="btn btn-primary mt-2 w-100"
// //                     onClick={captureFromWebcam}
// //                   >
// //                     Capture Image
// //                   </button>
// //                 </div>
// //               )}

// //               <div className="mb-3">
// //                 <div className="d-flex justify-content-between">
// //                   <label>Confidence Threshold: {confidenceThreshold}%</label>
// //                   <small>{predictions?.predictions?.length || 0} objects detected</small>
// //                 </div>
// //                 <input 
// //                   type="range" 
// //                   className="form-range" 
// //                   min="0" 
// //                   max="100" 
// //                   value={confidenceThreshold}
// //                   onChange={(e) => setConfidenceThreshold(e.target.value)}
// //                 />
// //               </div>

// //               <div className="mb-3">
// //                 <label>Overlap Threshold: {overlapThreshold}%</label>
// //                 <input 
// //                   type="range" 
// //                   className="form-range" 
// //                   min="0" 
// //                   max="100" 
// //                   value={overlapThreshold}
// //                   onChange={(e) => setOverlapThreshold(e.target.value)}
// //                 />
// //               </div>

// //               <div className="mb-3">
// //                 <label>Opacity Threshold: {opacityThreshold}%</label>
// //                 <input 
// //                   type="range" 
// //                   className="form-range" 
// //                   min="0" 
// //                   max="100" 
// //                   value={opacityThreshold}
// //                   onChange={(e) => setOpacityThreshold(e.target.value)}
// //                 />
// //               </div>

// //               <div className="mb-3">
// //                 <label>Label Display Mode:</label>
// //                 <select 
// //                   className="form-select"
// //                   value={labelMode}
// //                   onChange={(e) => setLabelMode(e.target.value)}
// //                 >
// //                   <option value="minimal">Minimal</option>
// //                   <option value="normal">Normal</option>
// //                   <option value="detailed">Detailed</option>
// //                 </select>
// //               </div>
// //             </div>

// //             {/* Right Column - Results */}
// //             <div className="col-md-8">
// //               <div className="border rounded p-3 h-100" style={{ position: 'relative' }}>
// //                 {imagePreview ? (
// //                   <>
// //                     <canvas 
// //                       ref={canvasRef}
// //                       style={{ maxWidth: '100%', height: 'auto' }}
// //                     />
// //                     <div className="mt-3">
// //                       <h5>Detection Results</h5>
// //                       <div className="table-responsive">
// //                         <table className="table table-sm">
// //                           <thead>
// //                             <tr>
// //                               <th>Class</th>
// //                               <th>Confidence</th>
// //                               <th>Position</th>
// //                               <th>Size</th>
// //                             </tr>
// //                           </thead>
// //                           <tbody>
// //                             {predictions?.predictions
// //                               .filter(pred => pred.confidence * 100 >= confidenceThreshold)
// //                               .map((pred, index) => (
// //                                 <tr key={index}>
// //                                   <td>
// //                                     <span 
// //                                       className="badge"
// //                                       style={{ 
// //                                         backgroundColor: pred.class === 'cavity' ? '#ff0000' : '#00ff00',
// //                                         color: 'white'
// //                                       }}
// //                                     >
// //                                       {pred.class}
// //                                     </span>
// //                                   </td>
// //                                   <td>{(pred.confidence * 100).toFixed(1)}%</td>
// //                                   <td>{Math.round(pred.x)}, {Math.round(pred.y)}</td>
// //                                   <td>{Math.round(pred.width)}×{Math.round(pred.height)}</td>
// //                                 </tr>
// //                               ))}
// //                           </tbody>
// //                         </table>
// //                       </div>

// //                       <div className="mt-3">
// //                         <h5>Model Performance</h5>
// //                         <div className="row">
// //                           <div className="col-md-4">
// //                             <div className="card bg-light">
// //                               <div className="card-body text-center">
// //                                 <h6 className="card-title">mAP (all)</h6>
// //                                 <p className="card-text fs-4">{predictions?.mAP.all}%</p>
// //                               </div>
// //                             </div>
// //                           </div>
// //                           <div className="col-md-4">
// //                             <div className="card bg-light">
// //                               <div className="card-body text-center">
// //                                 <h6 className="card-title">Cavity</h6>
// //                                 <p className="card-text fs-4">{predictions?.mAP.cavity}%</p>
// //                               </div>
// //                             </div>
// //                           </div>
// //                           <div className="col-md-4">
// //                             <div className="card bg-light">
// //                               <div className="card-body text-center">
// //                                 <h6 className="card-title">Normal</h6>
// //                                 <p className="card-text fs-4">{predictions?.mAP.normal}%</p>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </>
// //                 ) : (
// //                   <div className="text-center text-muted py-5">
// //                     <i className="bi bi-image fs-1"></i>
// //                     <p>Upload an image to analyze</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="card-footer text-end">
// //           <button 
// //             onClick={() => navigate('/dentist')}
// //             className="btn btn-secondary me-2"
// //           >
// //             <i className="bi bi-arrow-left me-1"></i>
// //             Back to Dashboard
// //           </button>
// //           <button className="btn btn-primary" disabled={!predictions}>
// //             <i className="bi bi-save me-1"></i>
// //             Save Results
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CariesDetection;

// // import React, { useState, useRef } from 'react';
// // import axios from 'axios';
import './CariesDetection.css';

// // const CariesDetection = () => {
// //   const [image, setImage] = useState(null);
// //   const [predictions, setPredictions] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const fileInputRef = useRef(null);
// //   const canvasRef = useRef(null);

// //   // Roboflow model details
// //   const MODEL_API_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkkl5/1";
// //   const API_KEY = process.env.REACT_APP_ROBOFLOW_API_KEY;

// //   const handleImageUpload = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         setImage(event.target.result);
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const detectCaries = async () => {
// //     if (!image) return;

// //     setLoading(true);
// //     setError(null);

// //     try {
// //       const base64Data = image.split(',')[1];
// //       const response = await axios.post(
// //         MODEL_API_URL,
// //         base64Data,
// //         {
// //           params: { api_key: API_KEY },
// //           headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //         }
// //       );

// //       setPredictions(response.data.predictions);
// //       drawPredictionsOnCanvas();
// //     } catch (err) {
// //       setError("Failed to detect caries. Please try again.");
// //       console.error("Detection error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const drawPredictionsOnCanvas = () => {
// //     if (!canvasRef.current || !image) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const img = new Image();

// //     img.onload = () => {
// //       canvas.width = img.width;
// //       canvas.height = img.height;
// //       ctx.drawImage(img, 0, 0, img.width, img.height);

// //       predictions.forEach(prediction => {
// //         const { x, y, width, height, class: className, confidence } = prediction;
        
// //         // Draw bounding box
// //         ctx.strokeStyle = className === 'cavity' ? 'red' : 'green';
// //         ctx.lineWidth = 2;
// //         ctx.strokeRect(x - width/2, y - height/2, width, height);

// //         // Draw label
// //         ctx.fillStyle = className === 'cavity' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 255, 0, 0.7)';
// //         const text = `${className} (${(confidence * 100).toFixed(1)}%)`;
// //         const textWidth = ctx.measureText(text).width;
// //         ctx.fillRect(x - width/2, y - height/2 - 20, textWidth + 10, 20);
// //         ctx.fillStyle = 'white';
// //         ctx.font = '14px Arial';
// //         ctx.fillText(text, x - width/2 + 5, y - height/2 - 5);
// //       });
// //     };

// //     img.src = image;
// //   };

// //   const triggerFileInput = () => fileInputRef.current.click();

// //   return (
// //     <div className="caries-detection-container">
// //       <h2>Dental Caries Detection</h2>
      
// //       <div className="detection-controls">
// //         <input
// //           type="file"
// //           ref={fileInputRef}
// //           onChange={handleImageUpload}
// //           accept="image/*"
// //           style={{ display: 'none' }}
// //         />
// //         <button onClick={triggerFileInput} className="btn btn-primary">
// //           {image ? 'Change Image' : 'Upload Dental Image'}
// //         </button>
        
// //         {image && (
// //           <button 
// //             onClick={detectCaries} 
// //             disabled={loading}
// //             className="btn btn-secondary"
// //           >
// //             {loading ? 'Detecting...' : 'Detect Caries'}
// //           </button>
// //         )}
// //       </div>

// //       {error && <div className="alert alert-danger">{error}</div>}

// //       <div className="results-section">
// //         {image && (
// //           <div className="image-canvas-container">
// //             <canvas ref={canvasRef} className="detection-canvas" />
// //           </div>
// //         )}

// //         {predictions.length > 0 && (
// //           <div className="results-summary">
// //             <h4>Detection Results</h4>
// //             <div className="results-stats">
// //               <p>Total detections: {predictions.length}</p>
// //               <p>Cavities found: {predictions.filter(p => p.class === 'cavity').length}</p>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default CariesDetection;

// // import { useEffect, useRef, useState } from 'react';
// // import Roboflow from '@roboflow-ai/roboflow-js';

// // const DentalCariesDetector = () => {
// //   const [predictions, setPredictions] = useState([]);
// //   const [model, setModel] = useState(null);
// //   const [isLoaded, setIsLoaded] = useState(false);
// //   const [activeModel, setActiveModel] = useState('dental-caries-3wij1-rkql5/1');
// //   const [confidenceThreshold, setConfidenceThreshold] = useState(50);
// //   const [overlapThreshold, setOverlapThreshold] = useState(52);
// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const fileInputRef = useRef(null);

// //   // Available models configuration
// //   const availableModels = [
// //     {
// //       id: 'dental-caries-3wij1-rkql5/1',
// //       name: 'v1 (YOLOv11)',
// //       stats: {
// //         mAP: '75.4%',
// //         precision: '68.7%',
// //         recall: '70.5%',
// //         trainedOn: '631 Images',
// //         trainedDate: '2025-08-07',
// //         modelType: 'YOLOv11 Object Detection (Fast)'
// //       }
// //     },
// //     // Add other versions if available
// //   ];

// //   useEffect(() => {
// //     loadModel(activeModel);
// //   }, [activeModel]);

// //   const loadModel = async (modelId) => {
// //     setIsLoaded(false);
// //     setPredictions([]);
    
// //     const roboflow = new Roboflow({
// //       publishable_key: "YOUR_PUBLISHABLE_KEY"
// //     });

// //     try {
// //       const loadedModel = await roboflow.load({
// //         model: modelId.split('/')[0],
// //         version: parseInt(modelId.split('/')[1])
// //       });
      
// //       setModel(loadedModel);
// //       setIsLoaded(true);
// //     } catch (error) {
// //       console.error("Error loading model:", error);
// //     }
// //   };

// //   const startWebcamDetection = async () => {
// //     if (!model || !videoRef.current) return;

// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //       videoRef.current.srcObject = stream;
// //       videoRef.current.onloadedmetadata = () => {
// //         canvasRef.current.width = videoRef.current.videoWidth;
// //         canvasRef.current.height = videoRef.current.videoHeight;
// //       };

// //       const detectFrame = async () => {
// //         if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
// //           const detections = await model.detect(videoRef.current, {
// //             confidence: confidenceThreshold / 100,
// //             overlap: overlapThreshold / 100
// //           });
// //           setPredictions(detections);
// //           drawPredictions(detections);
// //         }
// //         requestAnimationFrame(detectFrame);
// //       };
// //       detectFrame();
// //     } catch (error) {
// //       console.error("Error accessing camera:", error);
// //     }
// //   };

// //   const handleFileUpload = (file) => {
// //     if (!model) return;

// //     const reader = new FileReader();
// //     reader.onload = async (e) => {
// //       const img = new Image();
// //       img.src = e.target.result;
      
// //       img.onload = async () => {
// //         canvasRef.current.width = img.width;
// //         canvasRef.current.height = img.height;
        
// //         const detections = await model.detect(img, {
// //           confidence: confidenceThreshold / 100,
// //           overlap: overlapThreshold / 100
// //         });
// //         setPredictions(detections);
// //         drawImageWithPredictions(img, detections);
// //       };
// //     };
// //     reader.readAsDataURL(file);
// //   };

// //   const drawPredictions = (detections) => {
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const video = videoRef.current;
    
// //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
// //     drawBoundingBoxes(ctx, detections);
// //   };

// //   const drawImageWithPredictions = (img, detections) => {
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
    
// //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
// //     drawBoundingBoxes(ctx, detections);
// //   };

// //   const drawBoundingBoxes = (ctx, detections) => {
// //     detections.forEach(pred => {
// //       const { x, y, width, height, class: className, confidence } = pred;
      
// //       // Set color based on class
// //       const color = className === 'caries' ? '#FF0000' : '#00FF00';
      
// //       // Draw bounding box
// //       ctx.strokeStyle = color;
// //       ctx.lineWidth = 3;
// //       ctx.strokeRect(x, y, width, height);
      
// //       // Draw label background
// //       const label = `${className} ${(confidence * 100).toFixed(1)}%`;
// //       ctx.font = '16px Arial';
// //       const textWidth = ctx.measureText(label).width;
      
// //       ctx.fillStyle = color;
// //       ctx.fillRect(x - 1, y - 25, textWidth + 10, 25);
      
// //       // Draw text
// //       ctx.fillStyle = '#000000';
// //       ctx.fillText(label, x + 5, y - 7);
// //     });
// //   };

// //   const stopWebcam = () => {
// //     if (videoRef.current && videoRef.current.srcObject) {
// //       videoRef.current.srcObject.getTracks().forEach(track => track.stop());
// //     }
// //   };

// //   return (
// //     <div className="container">
// //       <h1>Dental Caries Detection</h1>
      
// //       <div className="model-controls">
// //         <div className="model-selector">
// //           <label>Select Model Version:</label>
// //           <select 
// //             value={activeModel}
// //             onChange={(e) => setActiveModel(e.target.value)}
// //           >
// //             {availableModels.map(model => (
// //               <option key={model.id} value={model.id}>
// //                 {model.name} - mAP: {model.stats.mAP}
// //               </option>
// //             ))}
// //           </select>
// //         </div>
        
// //         <div className="model-stats">
// //           <h3>Model Statistics</h3>
// //           <p><strong>Model Type:</strong> {availableModels.find(m => m.id === activeModel).stats.modelType}</p>
// //           <p><strong>mAP@50:</strong> {availableModels.find(m => m.id === activeModel).stats.mAP}</p>
// //           <p><strong>Precision:</strong> {availableModels.find(m => m.id === activeModel).stats.precision}</p>
// //           <p><strong>Recall:</strong> {availableModels.find(m => m.id === activeModel).stats.recall}</p>
// //           <p><strong>Trained On:</strong> {availableModels.find(m => m.id === activeModel).stats.trainedOn}</p>
// //           <p><strong>Training Date:</strong> {availableModels.find(m => m.id === activeModel).stats.trainedDate}</p>
// //         </div>
// //       </div>
      
// //       <div className="threshold-controls">
// //         <div>
// //           <label>Confidence Threshold: {confidenceThreshold}%</label>
// //           <input 
// //             type="range" 
// //             min="0" 
// //             max="100" 
// //             value={confidenceThreshold}
// //             onChange={(e) => setConfidenceThreshold(e.target.value)}
// //           />
// //         </div>
// //         <div>
// //           <label>Overlap Threshold: {overlapThreshold}%</label>
// //           <input 
// //             type="range" 
// //             min="0" 
// //             max="100" 
// //             value={overlapThreshold}
// //             onChange={(e) => setOverlapThreshold(e.target.value)}
// //           />
// //         </div>
// //       </div>
      
// //       <div className="detection-options">
// //         <button onClick={startWebcamDetection} disabled={!isLoaded}>
// //           Try With Webcam
// //         </button>
// //         <button onClick={stopWebcam}>Stop Webcam</button>
        
// //         <div className="file-upload">
// //           <input 
// //             type="file" 
// //             ref={fileInputRef}
// //             accept="image/*,video/*"
// //             onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
// //             style={{ display: 'none' }}
// //           />
// //           <button onClick={() => fileInputRef.current.click()}>
// //             Upload Image or Video
// //           </button>
// //         </div>
// //       </div>
      
// //       <div className="detection-view">
// //         <div className="canvas-container">
// //           <video 
// //             ref={videoRef} 
// //             autoPlay 
// //             playsInline 
// //             style={{ display: 'none' }} 
// //           />
// //           <canvas 
// //             ref={canvasRef} 
// //             style={{ border: '1px solid #ccc', maxWidth: '100%' }}
// //           />
// //         </div>
        
// //         <div className="predictions-panel">
// //           <h3>Detection Results ({predictions.length} objects detected)</h3>
// //           <div className="predictions-list">
// //             {predictions.map((pred, index) => (
// //               <div key={index} className="prediction-item">
// //                 <span className="prediction-class" style={{ 
// //                   color: pred.class === 'caries' ? 'red' : 'green' 
// //                 }}>
// //                   {pred.class}
// //                 </span>
// //                 <span className="prediction-confidence">
// //                   {(pred.confidence * 100).toFixed(1)}%
// //                 </span>
// //                 <div className="prediction-coords">
// //                   x: {pred.x.toFixed(1)}, y: {pred.y.toFixed(1)}, w: {pred.width.toFixed(1)}, h: {pred.height.toFixed(1)}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
      
// //       <style jsx>{`
// //         .container {
// //           max-width: 1200px;
// //           margin: 0 auto;
// //           padding: 20px;
// //           font-family: Arial, sans-serif;
// //         }
        
// //         .model-controls {
// //           display: flex;
// //           gap: 30px;
// //           margin-bottom: 20px;
// //         }
        
// //         .model-selector {
// //           flex: 1;
// //         }
        
// //         .model-stats {
// //           flex: 1;
// //           background: #f5f5f5;
// //           padding: 15px;
// //           border-radius: 5px;
// //         }
        
// //         .threshold-controls {
// //           display: flex;
// //           gap: 20px;
// //           margin-bottom: 20px;
// //         }
        
// //         .threshold-controls div {
// //           flex: 1;
// //         }
        
// //         .threshold-controls input {
// //           width: 100%;
// //         }
        
// //         .detection-options {
// //           display: flex;
// //           gap: 10px;
// //           margin-bottom: 20px;
// //         }
        
// //         .detection-view {
// //           display: flex;
// //           gap: 20px;
// //         }
        
// //         .canvas-container {
// //           flex: 2;
// //         }
        
// //         .predictions-panel {
// //           flex: 1;
// //           background: #f5f5f5;
// //           padding: 15px;
// //           border-radius: 5px;
// //           max-height: 500px;
// //           overflow-y: auto;
// //         }
        
// //         .predictions-list {
// //           margin-top: 10px;
// //         }
        
// //         .prediction-item {
// //           padding: 8px;
// //           margin-bottom: 8px;
// //           background: white;
// //           border-radius: 4px;
// //         }
        
// //         .prediction-class {
// //           font-weight: bold;
// //           margin-right: 10px;
// //         }
        
// //         .prediction-coords {
// //           font-size: 12px;
// //           color: #666;
// //           margin-top: 4px;
// //         }
        
// //         select, button {
// //           padding: 8px 12px;
// //           border-radius: 4px;
// //           border: 1px solid #ccc;
// //           background: white;
// //           cursor: pointer;
// //         }
        
// //         button:disabled {
// //           opacity: 0.5;
// //           cursor: not-allowed;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default DentalCariesDetector;

// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const ObjectDetection = () => {
// //   const [image, setImage] = useState(null);
// //   const [predictions, setPredictions] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   const handleImageUpload = (e) => {
// //     setImage(e.target.files[0]);
// //   };

// //   const detectObjects = async () => {
// //     if (!image) return;

// //     setLoading(true);
    
// //     try {
// //       // Convert image to Base64
// //       const reader = new FileReader();
// //       reader.readAsDataURL(image);
// //       reader.onloadend = async () => {
// //         const base64Image = reader.result.split(',')[1]; // Remove data URL prefix
        
// //         // Call Roboflow API
// //         const response = await axios.post(
// //           `https://detect.roboflow.com/your-project-id/version`,
// //           base64Image,
// //           {
// //             params: {
// //               api_key: "YOUR_API_KEY",
// //               confidence: 50,  // Adjust threshold
// //               format: "json",
// //             },
// //             headers: {
// //               "Content-Type": "application/x-www-form-urlencoded",
// //             },
// //           }
// //         );
        
// //         setPredictions(response.data.predictions);
// //       };
// //     } catch (error) {
// //       console.error("Detection error:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div>
// //       <h1>Object Detection with Roboflow</h1>
// //       <input type="file" accept="image/*" onChange={handleImageUpload} />
// //       <button onClick={detectObjects} disabled={!image || loading}>
// //         {loading ? "Processing..." : "Detect Objects"}
// //       </button>

// //       {/* Display Results */}
// //       {predictions.length > 0 && (
// //         <div>
// //           <h3>Detected Objects:</h3>
// //           <ul>
// //             {predictions.map((pred, idx) => (
// //               <li key={idx}>
// //                 {pred.class} (Confidence: {(pred.confidence * 100).toFixed(1)}%)
// //               </li>
// //             ))}
// //           </ul>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ObjectDetection;

// import React, { useState } from 'react';
// import axios from 'axios';

// const ObjectDetector = () => {
//   const [image, setImage] = useState(null);
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = (e) => {
//     setImage(URL.createObjectURL(e.target.files[0]));
//   };

//   const detectObjects = async () => {
//     if (!image) return;
    
//     setLoading(true);
//     try {
//       const response = await axios({
//         method: "POST",
//         url: "https://detect.roboflow.com/your-model/42",
//         params: {
//           api_key: "YOUR_API_KEY",
//         },
//         data: image.split(',')[1], // Remove data URL prefix if present
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded"
//         }
//       });
//       setResults(response.data);
//     } catch (error) {
//       console.error("Detection error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Object Detection</h2>
//       <input type="file" accept="image/*" onChange={handleImageUpload} />
//       <button onClick={detectObjects} disabled={!image || loading}>
//         {loading ? 'Detecting...' : 'Detect Objects'}
//       </button>
      
//       {image && (
//         <div style={{ position: 'relative', marginTop: '20px' }}>
//           <img src={image} alt="Uploaded" style={{ maxWidth: '100%' }} />
//           {results?.predictions?.map((prediction, index) => (
//             <div
//               key={index}
//               style={{
//                 position: 'absolute',
//                 left: `${prediction.x - prediction.width / 2}px`,
//                 top: `${prediction.y - prediction.height / 2}px`,
//                 width: `${prediction.width}px`,
//                 height: `${prediction.height}px`,
//                 border: '2px solid red',
//                 backgroundColor: 'rgba(255, 0, 0, 0.2)',
//               }}
//             >
//               <span style={{
//                 position: 'absolute',
//                 bottom: '100%',
//                 color: 'white',
//                 background: 'red',
//                 padding: '2px 5px',
//                 fontSize: '12px'
//               }}>
//                 {prediction.class} ({Math.round(prediction.confidence * 100)}%)
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
      
//       {results && (
//         <pre style={{ marginTop: '20px' }}>
//           {JSON.stringify(results, null, 2)}
//         </pre>
//       )}
//     </div>
//   );
// };

// export default ObjectDetector;


// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// const CariesDetection = () => {
//   // Refs
//   const fileInputRef = useRef(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
  
//   // State
//   const [imagePreview, setImagePreview] = useState(null);
//   const [predictions, setPredictions] = useState(null);
//   const [isWebcamActive, setIsWebcamActive] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [confidenceThreshold, setConfidenceThreshold] = useState(50);
//   const [error, setError] = useState(null);

//   // Roboflow configuration
//   const MODEL_API_URL = "https://detect.roboflow.com/caries-novip-w2b0v/1";
//   const API_KEY = "Qcew4U3hqVjLjWergC5l"; // Move to env in production

//   // Handle file upload
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setImagePreview(event.target.result);
//         analyzeImage(event.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Analyze image with Roboflow API
//   const analyzeImage = async (imageSrc) => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const base64Data = imageSrc.split(',')[1];
//       const response = await axios.post(
//         MODEL_API_URL,
//         base64Data,
//         {
//           params: { api_key: API_KEY },
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         }
//       );
      
//       setPredictions(response.data);
//       drawBoundingBoxes(imageSrc, response.data.predictions);
//     } catch (err) {
//       setError("Failed to detect caries. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Draw bounding boxes on canvas
//   const drawBoundingBoxes = (imageSrc, boxes) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();
    
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
      
//       boxes.forEach(box => {
//         if (box.confidence * 100 >= confidenceThreshold) {
//           const color = box.class === 'cavity' ? '#ff0000' : '#00ff00';
          
//           // Draw bounding box
//           ctx.strokeStyle = color;
//           ctx.lineWidth = 2;
//           ctx.strokeRect(box.x, box.y, box.width, box.height);
          
//           // Draw label
//           ctx.fillStyle = color;
//           ctx.fillRect(box.x, box.y - 20, 100, 20);
//           ctx.fillStyle = '#ffffff';
//           ctx.font = '12px Arial';
//           ctx.fillText(
//             `${box.class} ${Math.round(box.confidence * 100)}%`, 
//             box.x + 5, 
//             box.y - 5
//           );
//         }
//       });
//     };
//     img.src = imageSrc;
//   };

//   // Webcam handling
//   const toggleWebcam = async () => {
//     if (isWebcamActive) {
//       if (videoRef.current.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       }
//       setIsWebcamActive(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = stream;
//         setIsWebcamActive(true);
//       } catch (err) {
//         setError("Error accessing webcam: " + err.message);
//       }
//     }
//   };

//   // Capture from webcam
//   const captureFromWebcam = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(videoRef.current, 0, 0);
    
//     const imageSrc = canvas.toDataURL('image/png');
//     setImagePreview(imageSrc);
//     analyzeImage(imageSrc);
//     toggleWebcam();
//   };

//   return (
//     <div className="container py-4">
//       <div className="card shadow-lg">
//         <div className="card-header bg-primary text-white">
//           <h2 className="mb-0">Dental Caries Detection</h2>
//         </div>
        
//         <div className="card-body">
//           <div className="row">
//             {/* Controls Column */}
//             <div className="col-md-4">
//               <div className="mb-3">
//                 <button 
//                   className="btn btn-outline-primary w-100"
//                   onClick={() => fileInputRef.current.click()}
//                 >
//                   Upload Image
//                 </button>
//                 <input 
//                   type="file" 
//                   ref={fileInputRef}
//                   className="d-none" 
//                   accept="image/*" 
//                   onChange={handleFileChange}
//                 />
//               </div>
              
//               <div className="mb-3">
//                 <button 
//                   className={`btn w-100 ${isWebcamActive ? 'btn-danger' : 'btn-outline-primary'}`}
//                   onClick={toggleWebcam}
//                 >
//                   {isWebcamActive ? 'Stop Webcam' : 'Use Webcam'}
//                 </button>
//               </div>
              
//               {isWebcamActive && (
//                 <div className="mb-3">
//                   <video 
//                     ref={videoRef} 
//                     autoPlay 
//                     playsInline
//                     className="w-100"
//                     style={{ border: '1px solid #ddd' }}
//                   />
//                   <button 
//                     className="btn btn-primary w-100 mt-2"
//                     onClick={captureFromWebcam}
//                   >
//                     Capture Image
//                   </button>
//                 </div>
//               )}
              
//               <div className="mb-3">
//                 <label className="form-label">
//                   Confidence Threshold: {confidenceThreshold}%
//                 </label>
//                 <input 
//                   type="range" 
//                   className="form-range" 
//                   min="0" 
//                   max="100" 
//                   value={confidenceThreshold}
//                   onChange={(e) => setConfidenceThreshold(e.target.value)}
//                 />
//               </div>
              
//               {error && (
//                 <div className="alert alert-danger">
//                   {error}
//                 </div>
//               )}
//             </div>
            
//             {/* Results Column */}
//             <div className="col-md-8">
//               {isLoading ? (
//                 <div className="text-center py-5">
//                   <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                   <p className="mt-2">Analyzing image...</p>
//                 </div>
//               ) : imagePreview ? (
//                 <div style={{ position: 'relative' }}>
//                   <canvas 
//                     ref={canvasRef}
//                     className="img-fluid"
//                   />
                  
//                   {predictions && (
//                     <div className="mt-3">
//                       <h5>Detection Results</h5>
//                       <div className="table-responsive">
//                         <table className="table table-sm">
//                           <thead>
//                             <tr>
//                               <th>Class</th>
//                               <th>Confidence</th>
//                               <th>Position</th>
//                               <th>Size</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {predictions.predictions
//                               .filter(pred => pred.confidence * 100 >= confidenceThreshold)
//                               .map((pred, index) => (
//                                 <tr key={index}>
//                                   <td>
//                                     <span 
//                                       className="badge"
//                                       style={{ 
//                                         backgroundColor: pred.class === 'cavity' ? '#ff0000' : '#00ff00',
//                                         color: 'white'
//                                       }}
//                                     >
//                                       {pred.class}
//                                     </span>
//                                   </td>
//                                   <td>{(pred.confidence * 100).toFixed(1)}%</td>
//                                   <td>{Math.round(pred.x)}, {Math.round(pred.y)}</td>
//                                   <td>{Math.round(pred.width)}×{Math.round(pred.height)}</td>
//                                 </tr>
//                               ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center text-muted py-5">
//                   <i className="bi bi-image fs-1"></i>
//                   <p>Upload an image to analyze</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CariesDetection;

// const axios = require("axios");
// const fs = require("fs");
// const { createCanvas, loadImage } = require("canvas");

// // Configuration - REPLACE THESE VALUES
// const CONFIG = {
//   IMAGE_PATH: "tooth.jpg",         // Your image file
//   MODEL_URL: "https://detect.roboflow.com/caries-novip-w2b0v/1",
//   API_KEY: "Qcew4U3hqVjLjWergC5l", // Your actual API key
//   OUTPUT_IMAGE: "result.jpg"       // Where to save visualization
// };

// async function detectAndVisualize() {
//   try {
//     // 1. Verify image exists
//     if (!fs.existsSync(CONFIG.IMAGE_PATH)) {
//       throw new Error(`Image not found: ${CONFIG.IMAGE_PATH}`);
//     }

//     // 2. Read and encode image
//     const image = fs.readFileSync(CONFIG.IMAGE_PATH, { encoding: "base64" });

//     // 3. Detect caries
//     console.log("⚡ Sending request to Roboflow...");
//     const response = await axios({
//       method: "POST",
//       url: CONFIG.MODEL_URL,
//       params: { api_key: CONFIG.API_KEY },
//       data: image,
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       timeout: 30000
//     });

//     // 4. Process results
//     const predictions = response.data.predictions || [];
//     console.log(`\n🔍 Found ${predictions.length} detections:`);
    
//     predictions.forEach((pred, i) => {
//       console.log(
//         `${i+1}. ${pred.class.toUpperCase()} (${Math.round(pred.confidence*100)}%)\n` +
//         `   Location: (${Math.round(pred.x)}, ${Math.round(pred.y)})\n` +
//         `   Size: ${Math.round(pred.width)}×${Math.round(pred.height)}px`
//       );
//     });

//     // 5. Create visualization
//     await drawDetectionResults(CONFIG.IMAGE_PATH, predictions, CONFIG.OUTPUT_IMAGE);
//     console.log(`\n🖼️ Visualization saved as: ${CONFIG.OUTPUT_IMAGE}`);

//   } catch (error) {
//     console.error("\n❌ Error:");
//     if (error.response) {
//       console.log(`Status: ${error.response.status}`);
//       console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
//     } else {
//       console.log(error.message);
//     }
//   }
// }

// async function drawDetectionResults(imagePath, predictions, outputPath) {
//   const img = await loadImage(imagePath);
//   const canvas = createCanvas(img.width, img.height);
//   const ctx = canvas.getContext("2d");
  
//   // Draw original image
//   ctx.drawImage(img, 0, 0);
  
//   // Draw each prediction
//   predictions.forEach(pred => {
//     const color = pred.class === "cavity" ? "#FF0000" : "#00FF00";
    
//     // Draw bounding box
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//     ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
    
//     // Draw label
//     ctx.fillStyle = color + "80"; // Add transparency
//     const text = `${pred.class} ${Math.round(pred.confidence*100)}%`;
//     const textWidth = ctx.measureText(text).width;
    
//     ctx.fillRect(pred.x - 2, pred.y - 25, textWidth + 10, 25);
//     ctx.fillStyle = "#FFFFFF";
//     ctx.font = "bold 14px Arial";
//     ctx.fillText(text, pred.x + 3, pred.y - 7);
//   });
  
//   // Save output
//   const out = fs.createWriteStream(outputPath);
//   const stream = canvas.createJPEGStream({ quality: 0.95 });
//   stream.pipe(out);
// }

// // Run the detection
// detectAndVisualize();

// import React, { useState, useRef } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow API configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://serverless.roboflow.com/dental-caries-3wij1-rkql5/1";

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Reset previous results
//     setPredictions([]);
//     setError(null);

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       setPredictions(response.data.predictions || []);
//       drawBoundingBoxes(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to detect caries. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const drawBoundingBoxes = (predictions) => {
//     if (!canvasRef.current || !image || !predictions) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions to match image
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Draw the image
//       ctx.drawImage(img, 0, 0, img.width, img.height);
      
//       // Draw each prediction
//       predictions.forEach(pred => {
//         const { x, y, width, height, class: className, confidence } = pred;
//         const color = className === 'cavity' ? 'red' : 'green';
        
//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 3;
//         ctx.strokeRect(x, y, width, height);
        
//         // Draw label background
//         ctx.fillStyle = color + '80'; // Add transparency
//         const label = `${className} ${Math.round(confidence * 100)}%`;
//         ctx.fillRect(x, y - 25, ctx.measureText(label).width + 10, 25);
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 14px Arial';
//         ctx.fillText(label, x + 5, y - 8);
//       });
//     };

//     img.src = image;
//   };

//   return (
//     <div style={{
//       maxWidth: '800px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h2 style={{ color: '#2c3e50', textAlign: 'center' }}>Dental Caries Detection</h2>
      
//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         margin: '20px 0',
//         justifyContent: 'center'
//       }}>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <button
//           onClick={() => fileInputRef.current.click()}
//           style={{
//             padding: '10px 15px',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           {image ? 'Change Image' : 'Upload Dental Image'}
//         </button>
        
//         {image && (
//           <button
//             onClick={detectCaries}
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: loading ? '#95a5a6' : '#2ecc71',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer'
//             }}
//           >
//             {loading ? 'Detecting...' : 'Detect Caries'}
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           padding: '10px',
//           backgroundColor: '#e74c3c',
//           color: 'white',
//           borderRadius: '4px',
//           margin: '10px 0'
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ textAlign: 'center' }}>
//         {image && (
//           <canvas
//             ref={canvasRef}
//             style={{
//               maxWidth: '100%',
//               border: '1px solid #ddd',
//               margin: '10px 0'
//             }}
//           />
//         )}
//       </div>

//       {predictions.length > 0 && (
//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '15px',
//           borderRadius: '4px',
//           marginTop: '20px'
//         }}>
//           <h3 style={{ marginTop: 0 }}>Detection Results</h3>
//           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//             <div>
//               <strong>Total Detections:</strong> {predictions.length}
//             </div>
//             <div>
//               <strong>Cavities Found:</strong> {
//                 predictions.filter(p => p.class === 'cavity').length
//               }
//             </div>
//           </div>
          
//           <div style={{ marginTop: '10px' }}>
//             {predictions.map((pred, i) => (
//               <div key={i} style={{
//                 padding: '10px',
//                 borderBottom: '1px solid #eee',
//                 display: 'flex',
//                 justifyContent: 'space-between'
//               }}>
//                 <div>
//                   <span style={{
//                     color: pred.class === 'cavity' ? '#e74c3c' : '#2ecc71',
//                     fontWeight: 'bold'
//                   }}>
//                     {pred.class.toUpperCase()}
//                   </span>
//                   <span> ({Math.round(pred.confidence * 100)}%)</span>
//                 </div>
//                 <div>
//                   {Math.round(pred.width)}×{Math.round(pred.height)}px
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Caries_detection;

// import React, { useState, useRef } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration - USE YOUR ACTUAL VALUES
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Reset previous results
//     setPredictions([]);
//     setError(null);

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       // Verify your model's response structure
//       console.log("API Response:", response.data);
      
//       if (!response.data.predictions) {
//         throw new Error("Unexpected response format");
//       }

//       setPredictions(response.data.predictions);
//       drawBoundingBoxes(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const drawBoundingBoxes = (predictions) => {
//     if (!canvasRef.current || !image) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);

//       predictions.forEach(pred => {
//         const color = pred.class === 'caries' ? 'red' : 'green'; // Change to 'cavity' if needed
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
        
//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label
//         ctx.fillStyle = color + '80'; // Add transparency
//         ctx.fillRect(pred.x - 2, pred.y - 20, ctx.measureText(label).width + 10, 20);
//         ctx.fillStyle = 'white';
//         ctx.font = '12px Arial';
//         ctx.fillText(label, pred.x + 3, pred.y - 5);
//       });
//     };

//     img.src = image;
//   };

//   return (
//     <div style={{
//       maxWidth: '800px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h2 style={{ 
//         color: '#2c3e50', 
//         textAlign: 'center',
//         marginBottom: '30px'
//       }}>
//         Dental Caries Detection
//       </h2>
      
//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         margin: '20px 0',
//         justifyContent: 'center'
//       }}>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <button
//           onClick={() => fileInputRef.current.click()}
//           style={{
//             padding: '10px 15px',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '16px'
//           }}
//         >
//           {image ? 'Change Image' : 'Upload Dental Image'}
//         </button>
        
//         {image && (
//           <button
//             onClick={detectCaries}
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: loading ? '#95a5a6' : '#2ecc71',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontSize: '16px'
//             }}
//           >
//             {loading ? (
//               <>
//                 <span style={{ marginRight: '8px' }}>
//                   <i className="fas fa-spinner fa-spin"></i>
//                 </span>
//                 Detecting...
//               </>
//             ) : 'Detect Caries'}
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           padding: '15px',
//           backgroundColor: '#e74c3c',
//           color: 'white',
//           borderRadius: '4px',
//           margin: '20px 0',
//           textAlign: 'center'
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ 
//         textAlign: 'center',
//         margin: '20px 0'
//       }}>
//         {image && (
//           <canvas
//             ref={canvasRef}
//             style={{
//               maxWidth: '100%',
//               border: '1px solid #ddd',
//               boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//             }}
//           />
//         )}
//       </div>

//       {predictions.length > 0 && (
//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '20px',
//           borderRadius: '8px',
//           marginTop: '30px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//         }}>
//           <h3 style={{ 
//             marginTop: '0',
//             color: '#2c3e50',
//             borderBottom: '1px solid #eee',
//             paddingBottom: '10px'
//           }}>
//             Detection Results
//           </h3>
          
//           <div style={{ 
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '15px'
//           }}>
//             <div style={{ fontWeight: 'bold' }}>
//               Total Detections: <span style={{ color: '#3498db' }}>{predictions.length}</span>
//             </div>
//             <div style={{ fontWeight: 'bold' }}>
//               Cavities Found: <span style={{ color: '#e74c3c' }}>
//                 {predictions.filter(p => p.class === 'caries').length}
//               </span>
//             </div>
//           </div>
          
//           <div style={{ 
//             maxHeight: '300px',
//             overflowY: 'auto'
//           }}>
//             {predictions.map((pred, i) => (
//               <div key={i} style={{
//                 padding: '12px 10px',
//                 borderBottom: '1px solid #eee',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center'
//               }}>
//                 <div>
//                   <span style={{
//                     color: pred.class === 'caries' ? '#e74c3c' : '#2ecc71',
//                     fontWeight: 'bold',
//                     textTransform: 'capitalize'
//                   }}>
//                     {pred.class}
//                   </span>
//                   <span> ({Math.round(pred.confidence * 100)}% confidence)</span>
//                 </div>
//                 <div style={{
//                   backgroundColor: '#ecf0f1',
//                   padding: '3px 8px',
//                   borderRadius: '4px',
//                   fontSize: '14px'
//                 }}>
//                   {Math.round(pred.width)}×{Math.round(pred.height)}px
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Caries_detection;


// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     if (image && predictions.length > 0 && canvasRef.current) {
//       drawBoundingBoxes(predictions);
//     }
//   }, [image, predictions]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const drawBoundingBoxes = (predictions) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !image) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and redraw
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw predictions
//       predictions.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? 'red' : 'green';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = `${color}CC`; // Add transparency
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 12px Arial';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = image;
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = ''; // Reset file input
//   };

//   return (
//     <div style={{
//       maxWidth: '800px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h2 style={{ 
//         color: '#2c3e50', 
//         textAlign: 'center',
//         marginBottom: '30px'
//       }}>
//         Dental Caries Detection
//       </h2>
      
//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         margin: '20px 0',
//         justifyContent: 'center',
//         flexWrap: 'wrap'
//       }}>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <button
//           onClick={() => fileInputRef.current.click()}
//           style={{
//             padding: '10px 15px',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '16px',
//             minWidth: '180px'
//           }}
//         >
//           {image ? 'Change Image' : 'Upload Dental Image'}
//         </button>
        
//         {image && (
//           <button
//             onClick={detectCaries}
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: loading ? '#95a5a6' : '#2ecc71',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               minWidth: '180px'
//             }}
//           >
//             {loading ? 'Detecting...' : 'Detect Caries'}
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           padding: '15px',
//           backgroundColor: '#e74c3c',
//           color: 'white',
//           borderRadius: '4px',
//           margin: '20px 0',
//           textAlign: 'center'
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ 
//         textAlign: 'center',
//         margin: '20px 0'
//       }}>
//         {image && (
//           <canvas
//             ref={canvasRef}
//             style={{
//               maxWidth: '100%',
//               maxHeight: '500px',
//               border: '1px solid #ddd',
//               boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//             }}
//           />
//         )}
//       </div>

//       {predictions.length > 0 && (
//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '20px',
//           borderRadius: '8px',
//           marginTop: '30px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//         }}>
//           <h3 style={{ 
//             marginTop: '0',
//             color: '#2c3e50',
//             borderBottom: '1px solid #eee',
//             paddingBottom: '10px'
//           }}>
//             Detection Results
//           </h3>
          
//           <div style={{ 
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '15px',
//             flexWrap: 'wrap',
//             gap: '10px'
//           }}>
//             <div style={{ fontWeight: 'bold' }}>
//               Total Detections: <span style={{ color: '#3498db' }}>{predictions.length}</span>
//             </div>
//             <div style={{ fontWeight: 'bold' }}>
//               Cavities Found: <span style={{ color: '#e74c3c' }}>
//                 {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//               </span>
//             </div>
//           </div>
          
//           <div style={{ 
//             maxHeight: '300px',
//             overflowY: 'auto'
//           }}>
//             {predictions.map((pred, i) => (
//               <div key={i} style={{
//                 padding: '12px 10px',
//                 borderBottom: '1px solid #eee',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 flexWrap: 'wrap',
//                 gap: '10px'
//               }}>
//                 <div>
//                   <span style={{
//                     color: pred.class.toLowerCase().includes('cavity') ? '#e74c3c' : '#2ecc71',
//                     fontWeight: 'bold',
//                     textTransform: 'capitalize'
//                   }}>
//                     {pred.class}
//                   </span>
//                   <span> ({Math.round(pred.confidence * 100)}% confidence)</span>
//                 </div>
//                 <div style={{
//                   backgroundColor: '#ecf0f1',
//                   padding: '3px 8px',
//                   borderRadius: '4px',
//                   fontSize: '14px'
//                 }}>
//                   {Math.round(pred.width)}×{Math.round(pred.height)}px
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {(image || predictions.length > 0) && (
//         <div style={{ textAlign: 'center', marginTop: '30px' }}>
//           <button
//             onClick={clearData}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#e74c3c',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '16px'
//             }}
//           >
//             Clear All Data
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Caries_detection;

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   const drawBoundingBoxes = useCallback((predictions) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !image) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and redraw
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw predictions
//       predictions.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? 'red' : 'green';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = `${color}CC`; // Add transparency
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 12px Arial';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = image;
//   }, [image]);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     if (image && predictions.length > 0 && canvasRef.current) {
//       drawBoundingBoxes(predictions);
//     }
//   }, [image, predictions, drawBoundingBoxes]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = ''; // Reset file input
//   };

//   return (
//     <div style={{
//       maxWidth: '800px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h2 style={{ 
//         color: '#2c3e50', 
//         textAlign: 'center',
//         marginBottom: '30px'
//       }}>
//         Dental Caries Detection
//       </h2>
      
//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         margin: '20px 0',
//         justifyContent: 'center',
//         flexWrap: 'wrap'
//       }}>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <button
//           onClick={() => fileInputRef.current.click()}
//           style={{
//             padding: '10px 15px',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '16px',
//             minWidth: '180px'
//           }}
//         >
//           {image ? 'Change Image' : 'Upload Dental Image'}
//         </button>
        
//         {image && (
//           <button
//             onClick={detectCaries}
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: loading ? '#95a5a6' : '#2ecc71',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               minWidth: '180px'
//             }}
//           >
//             {loading ? 'Detecting...' : 'Detect Caries'}
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           padding: '15px',
//           backgroundColor: '#e74c3c',
//           color: 'white',
//           borderRadius: '4px',
//           margin: '20px 0',
//           textAlign: 'center'
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ 
//         textAlign: 'center',
//         margin: '20px 0'
//       }}>
//         {image && (
//           <canvas
//             ref={canvasRef}
//             style={{
//               maxWidth: '100%',
//               maxHeight: '500px',
//               border: '1px solid #ddd',
//               boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//             }}
//           />
//         )}
//       </div>

//       {predictions.length > 0 && (
//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '20px',
//           borderRadius: '8px',
//           marginTop: '30px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//         }}>
//           <h3 style={{ 
//             marginTop: '0',
//             color: '#2c3e50',
//             borderBottom: '1px solid #eee',
//             paddingBottom: '10px'
//           }}>
//             Detection Results
//           </h3>
          
//           <div style={{ 
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '15px',
//             flexWrap: 'wrap',
//             gap: '10px'
//           }}>
//             <div style={{ fontWeight: 'bold' }}>
//               Total Detections: <span style={{ color: '#3498db' }}>{predictions.length}</span>
//             </div>
//             <div style={{ fontWeight: 'bold' }}>
//               Cavities Found: <span style={{ color: '#e74c3c' }}>
//                 {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//               </span>
//             </div>
//           </div>
          
//           <div style={{ 
//             maxHeight: '300px',
//             overflowY: 'auto'
//           }}>
//             {predictions.map((pred, i) => (
//               <div key={i} style={{
//                 padding: '12px 10px',
//                 borderBottom: '1px solid #eee',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 flexWrap: 'wrap',
//                 gap: '10px'
//               }}>
//                 <div>
//                   <span style={{
//                     color: pred.class.toLowerCase().includes('cavity') ? '#e74c3c' : '#2ecc71',
//                     fontWeight: 'bold',
//                     textTransform: 'capitalize'
//                   }}>
//                     {pred.class}
//                   </span>
//                   <span> ({Math.round(pred.confidence * 100)}% confidence)</span>
//                 </div>
//                 <div style={{
//                   backgroundColor: '#ecf0f1',
//                   padding: '3px 8px',
//                   borderRadius: '4px',
//                   fontSize: '14px'
//                 }}>
//                   {Math.round(pred.width)}×{Math.round(pred.height)}px
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {(image || predictions.length > 0) && (
//         <div style={{ textAlign: 'center', marginTop: '30px' }}>
//           <button
//             onClick={clearData}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#e74c3c',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '16px'
//             }}
//           >
//             Clear All Data
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Caries_detection;


// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and draw image
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw predictions if they exist
//       preds.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? 'red' : 'green';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = `${color}CC`; // Add transparency
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 12px Arial';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//       // Immediately draw the uploaded image
//       drawOnCanvas(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = ''; // Reset file input
//   };

//   return (
//     <div style={{
//       maxWidth: '800px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h2 style={{ 
//         color: '#2c3e50', 
//         textAlign: 'center',
//         marginBottom: '30px'
//       }}>
//         Dental Caries Detection
//       </h2>
      
//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         margin: '20px 0',
//         justifyContent: 'center',
//         flexWrap: 'wrap'
//       }}>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <button
//           onClick={() => fileInputRef.current.click()}
//           style={{
//             padding: '10px 15px',
//             backgroundColor: '#3498db',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '16px',
//             minWidth: '180px'
//           }}
//         >
//           {image ? 'Change Image' : 'Upload Dental Image'}
//         </button>
        
//         {image && (
//           <button
//             onClick={detectCaries}
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: loading ? '#95a5a6' : '#2ecc71',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontSize: '16px',
//               minWidth: '180px'
//             }}
//           >
//             {loading ? 'Detecting...' : 'Detect Caries'}
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{
//           padding: '15px',
//           backgroundColor: '#e74c3c',
//           color: 'white',
//           borderRadius: '4px',
//           margin: '20px 0',
//           textAlign: 'center'
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ 
//         textAlign: 'center',
//         margin: '20px 0'
//       }}>
//         {image && (
//           <canvas
//             ref={canvasRef}
//             style={{
//               maxWidth: '100%',
//               maxHeight: '500px',
//               border: '1px solid #ddd',
//               boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//             }}
//           />
//         )}
//       </div>

//       {predictions.length > 0 && (
//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '20px',
//           borderRadius: '8px',
//           marginTop: '30px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//         }}>
//           <h3 style={{ 
//             marginTop: '0',
//             color: '#2c3e50',
//             borderBottom: '1px solid #eee',
//             paddingBottom: '10px'
//           }}>
//             Detection Results
//           </h3>
          
//           <div style={{ 
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '15px',
//             flexWrap: 'wrap',
//             gap: '10px'
//           }}>
//             <div style={{ fontWeight: 'bold' }}>
//               Total Detections: <span style={{ color: '#3498db' }}>{predictions.length}</span>
//             </div>
//             <div style={{ fontWeight: 'bold' }}>
//               Cavities Found: <span style={{ color: '#e74c3c' }}>
//                 {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//               </span>
//             </div>
//           </div>
          
//           <div style={{ 
//             maxHeight: '300px',
//             overflowY: 'auto'
//           }}>
//             {predictions.map((pred, i) => (
//               <div key={i} style={{
//                 padding: '12px 10px',
//                 borderBottom: '1px solid #eee',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 flexWrap: 'wrap',
//                 gap: '10px'
//               }}>
//                 <div>
//                   <span style={{
//                     color: pred.class.toLowerCase().includes('cavity') ? '#e74c3c' : '#2ecc71',
//                     fontWeight: 'bold',
//                     textTransform: 'capitalize'
//                   }}>
//                     {pred.class}
//                   </span>
//                   <span> ({Math.round(pred.confidence * 100)}% confidence)</span>
//                 </div>
//                 <div style={{
//                   backgroundColor: '#ecf0f1',
//                   padding: '3px 8px',
//                   borderRadius: '4px',
//                   fontSize: '14px'
//                 }}>
//                   {Math.round(pred.width)}×{Math.round(pred.height)}px
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {(image || predictions.length > 0) && (
//         <div style={{ textAlign: 'center', marginTop: '30px' }}>
//           <button
//             onClick={clearData}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#e74c3c',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '16px'
//             }}
//           >
//             Clear All Data
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Caries_detection;



// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and draw image
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw predictions if they exist
//       preds.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#2ED573';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = color;
//         ctx.globalAlpha = 0.8;
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
//         ctx.globalAlpha = 1.0;
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 12px "Segoe UI", sans-serif';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//       // Immediately draw the uploaded image
//       drawOnCanvas(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = ''; // Reset file input
//   };

//   return (
//     <div style={{
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '40px',
//       fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
//       backgroundColor: '#FFFFFF',
//       minHeight: '100vh',
//       boxShadow: '0 0 30px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         maxWidth: '1000px',
//         margin: '0 auto'
//       }}>
//         <header style={{
//           marginBottom: '40px',
//           textAlign: 'center',
//           borderBottom: '1px solid #F1F2F6',
//           paddingBottom: '20px'
//         }}>
//           <h1 style={{ 
//             color: '#2F3542', 
//             fontWeight: '600',
//             fontSize: '2.2rem',
//             marginBottom: '10px'
//           }}>
//             Dental Caries Detection System
//           </h1>
//           <p style={{
//             color: '#747D8C',
//             fontSize: '1.1rem',
//             maxWidth: '700px',
//             margin: '0 auto',
//             lineHeight: '1.6'
//           }}>
//             Advanced AI-powered detection of dental caries with precision visualization
//           </p>
//         </header>
        
//         <div style={{
//           display: 'flex',
//           gap: '30px',
//           flexWrap: 'wrap'
//         }}>
//           {/* Left Column - Controls */}
//           <div style={{
//             flex: '1',
//             minWidth: '300px'
//           }}>
//             <div style={{
//               backgroundColor: '#F8F9FA',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
//               height: '100%'
//             }}>
//               <h3 style={{
//                 color: '#2F3542',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#3742FA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Image Controls
//               </h3>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 style={{ display: 'none' }}
//               />
              
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 style={{
//                   width: '100%',
//                   padding: '15px',
//                   backgroundColor: '#3742FA',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '500',
//                   marginBottom: '15px',
//                   transition: 'all 0.3s ease',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px',
//                   ':hover': {
//                     backgroundColor: '#5352ED'
//                   }
//                 }}
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 13V5H11V13H5L12 20L19 13H13Z" fill="white"/>
//                 </svg>
//                 {image ? 'Change Dental Image' : 'Upload Dental Image'}
//               </button>
              
//               {image && (
//                 <button
//                   onClick={detectCaries}
//                   disabled={loading}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: loading ? '#A4B0BE' : '#2ED573',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     marginBottom: '25px',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     ':hover': {
//                       backgroundColor: loading ? '#A4B0BE' : '#20BF6B'
//                     }
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
//                         <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M8 12H16M12 16V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                       Detect Cavities
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {error && (
//                 <div style={{
//                   padding: '15px',
//                   backgroundColor: '#FF6B81',
//                   color: 'white',
//                   borderRadius: '8px',
//                   marginBottom: '25px',
//                   fontSize: '14px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px'
//                 }}>
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   {error}
//                 </div>
//               )}
              
//               {(image || predictions.length > 0) && (
//                 <button
//                   onClick={clearData}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: '#FF4757',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     ':hover': {
//                       backgroundColor: '#EB3B5A'
//                     }
//                   }}
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   Clear All Data
//                 </button>
//               )}
//             </div>
//           </div>
          
//           {/* Right Column - Results */}
//           <div style={{
//             flex: '2',
//             minWidth: '400px'
//           }}>
//             <div style={{
//               backgroundColor: '#F8F9FA',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 5px 15px rgba(0,0,0,0.03)'
//             }}>
//               <h3 style={{
//                 color: '#2F3542',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#3742FA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Detection Results
//               </h3>
              
//               <div style={{ 
//                 textAlign: 'center',
//                 marginBottom: '30px'
//               }}>
//                 {image ? (
//                   <canvas
//                     ref={canvasRef}
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '400px',
//                       borderRadius: '8px',
//                       boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
//                       backgroundColor: '#FFFFFF',
//                       border: '1px solid #E0E3E7'
//                     }}
//                   />
//                 ) : (
//                   <div style={{
//                     backgroundColor: '#FFFFFF',
//                     borderRadius: '8px',
//                     padding: '60px 20px',
//                     border: '1px dashed #DFE4EA',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     minHeight: '300px'
//                   }}>
//                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
//                       <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46972 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#747D8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     <p style={{
//                       color: '#747D8C',
//                       marginTop: '15px',
//                       fontSize: '16px'
//                     }}>
//                       Upload an X-ray image to begin analysis
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {predictions.length > 0 && (
//                 <div>
//                   <div style={{ 
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     marginBottom: '20px',
//                     flexWrap: 'wrap',
//                     gap: '15px'
//                   }}>
//                     <div style={{
//                       backgroundColor: '#E8F4FD',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px'
//                     }}>
//                       <div style={{
//                         color: '#57606F',
//                         fontSize: '14px',
//                         marginBottom: '5px'
//                       }}>
//                         Total Detections
//                       </div>
//                       <div style={{
//                         color: '#3742FA',
//                         fontSize: '24px',
//                         fontWeight: '600'
//                       }}>
//                         {predictions.length}
//                       </div>
//                     </div>
                    
//                     <div style={{
//                       backgroundColor: '#FDECEC',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px'
//                     }}>
//                       <div style={{
//                         color: '#57606F',
//                         fontSize: '14px',
//                         marginBottom: '5px'
//                       }}>
//                         Cavities Found
//                       </div>
//                       <div style={{
//                         color: '#FF4757',
//                         fontSize: '24px',
//                         fontWeight: '600'
//                       }}>
//                         {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     maxHeight: '300px',
//                     overflowY: 'auto',
//                     border: '1px solid #E0E3E7',
//                     borderRadius: '8px'
//                   }}>
//                     <table style={{
//                       width: '100%',
//                       borderCollapse: 'collapse'
//                     }}>
//                       <thead>
//                         <tr style={{
//                           backgroundColor: '#F1F2F6',
//                           position: 'sticky',
//                           top: '0'
//                         }}>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Detection</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Confidence</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Dimensions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {predictions.map((pred, i) => (
//                           <tr key={i} style={{
//                             borderBottom: '1px solid #E0E3E7',
//                             ':last-child': {
//                               borderBottom: 'none'
//                             }
//                           }}>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#2ED573',
//                               fontWeight: '500',
//                               textTransform: 'capitalize'
//                             }}>
//                               {pred.class}
//                             </td>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: '#2F3542'
//                             }}>
//                               {Math.round(pred.confidence * 100)}%
//                             </td>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: '#57606F',
//                               fontSize: '14px'
//                             }}>
//                               {Math.round(pred.width)}×{Math.round(pred.height)}px
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Caries_detection;


// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "Qcew4U3hqVjLjWergC5l";
//   const MODEL_URL = "https://detect.roboflow.com/dental-caries-3wij1-rkql5/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and draw image
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw predictions if they exist
//       preds.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#2ED573';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = color;
//         ctx.globalAlpha = 0.8;
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
//         ctx.globalAlpha = 1.0;
        
//         // Draw label text
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 12px "Segoe UI", sans-serif';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//       // Immediately draw the uploaded image
//       drawOnCanvas(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = ''; // Reset file input
//   };

//   return (
//     <div style={{
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '40px',
//       fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
//       backgroundColor: '#FFFFFF',
//       minHeight: '100vh',
//       boxShadow: '0 0 30px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         maxWidth: '1000px',
//         margin: '0 auto'
//       }}>
//         <header style={{
//           marginBottom: '40px',
//           textAlign: 'center',
//           borderBottom: '1px solid #F1F2F6',
//           paddingBottom: '20px'
//         }}>
//           <h1 style={{ 
//             color: '#2F3542', 
//             fontWeight: '600',
//             fontSize: '2.2rem',
//             marginBottom: '10px'
//           }}>
//             Caries Detection Model
//           </h1>
//           <p style={{
//             color: '#747D8C',
//             fontSize: '1.1rem',
//             maxWidth: '700px',
//             margin: '0 auto',
//             lineHeight: '1.6'
//           }}>
//             Advanced AI-powered detection of dental caries with precision visualization
//           </p>
//         </header>
        
//         <div style={{
//           display: 'flex',
//           gap: '30px',
//           flexWrap: 'wrap'
//         }}>
//           {/* Left Column - Controls */}
//           <div style={{
//             flex: '1',
//             minWidth: '300px'
//           }}>
//             <div style={{
//               backgroundColor: '#F8F9FA',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
//               height: '100%'
//             }}>
//               <h3 style={{
//                 color: '#2F3542',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#3742FA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Image Controls
//               </h3>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 style={{ display: 'none' }}
//               />
              
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 style={{
//                   width: '100%',
//                   padding: '15px',
//                   backgroundColor: '#3742FA',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '500',
//                   marginBottom: '15px',
//                   transition: 'all 0.3s ease',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px',
//                   ':hover': {
//                     backgroundColor: '#5352ED'
//                   }
//                 }}
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 13V5H11V13H5L12 20L19 13H13Z" fill="white"/>
//                 </svg>
//                 {image ? 'Change Dental Image' : 'Upload Dental Image'}
//               </button>
              
//               {image && (
//                 <button
//                   onClick={detectCaries}
//                   disabled={loading}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: loading ? '#A4B0BE' : '#2ED573',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     marginBottom: '25px',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     ':hover': {
//                       backgroundColor: loading ? '#A4B0BE' : '#20BF6B'
//                     }
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
//                         <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M8 12H16M12 16V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                       Detect Cavities
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {error && (
//                 <div style={{
//                   padding: '15px',
//                   backgroundColor: '#FF6B81',
//                   color: 'white',
//                   borderRadius: '8px',
//                   marginBottom: '25px',
//                   fontSize: '14px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px'
//                 }}>
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   {error}
//                 </div>
//               )}
              
//               {(image || predictions.length > 0) && (
//                 <button
//                   onClick={clearData}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: '#FF4757',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     ':hover': {
//                       backgroundColor: '#EB3B5A'
//                     }
//                   }}
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   Clear All Data
//                 </button>
//               )}
//             </div>
//           </div>
          
//           {/* Right Column - Results */}
//           <div style={{
//             flex: '2',
//             minWidth: '400px'
//           }}>
//             <div style={{
//               backgroundColor: '#F8F9FA',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 5px 15px rgba(0,0,0,0.03)'
//             }}>
//               <h3 style={{
//                 color: '#2F3542',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#3742FA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Detection Results
//               </h3>
              
//               <div style={{ 
//                 textAlign: 'center',
//                 marginBottom: '30px'
//               }}>
//                 {image ? (
//                   <canvas
//                     ref={canvasRef}
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '400px',
//                       borderRadius: '8px',
//                       boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
//                       backgroundColor: '#FFFFFF',
//                       border: '1px solid #E0E3E7'
//                     }}
//                   />
//                 ) : (
//                   <div style={{
//                     backgroundColor: '#FFFFFF',
//                     borderRadius: '8px',
//                     padding: '60px 20px',
//                     border: '1px dashed #DFE4EA',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     minHeight: '300px'
//                   }}>
//                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
//                       <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46972 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#747D8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     <p style={{
//                       color: '#747D8C',
//                       marginTop: '15px',
//                       fontSize: '16px'
//                     }}>
//                       Upload a dental image to begin analysis
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {predictions.length > 0 && (
//                 <div>
//                   <div style={{ 
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     marginBottom: '20px',
//                     flexWrap: 'wrap',
//                     gap: '15px'
//                   }}>
//                     <div style={{
//                       backgroundColor: '#E8F4FD',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px'
//                     }}>
//                       <div style={{
//                         color: '#57606F',
//                         fontSize: '14px',
//                         marginBottom: '5px'
//                       }}>
//                         Total Detections
//                       </div>
//                       <div style={{
//                         color: '#3742FA',
//                         fontSize: '24px',
//                         fontWeight: '600'
//                       }}>
//                         {predictions.length}
//                       </div>
//                     </div>
                    
//                     <div style={{
//                       backgroundColor: '#FDECEC',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px'
//                     }}>
//                       <div style={{
//                         color: '#57606F',
//                         fontSize: '14px',
//                         marginBottom: '5px'
//                       }}>
//                         Cavities Found
//                       </div>
//                       <div style={{
//                         color: '#FF4757',
//                         fontSize: '24px',
//                         fontWeight: '600'
//                       }}>
//                         {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     maxHeight: '300px',
//                     overflowY: 'auto',
//                     border: '1px solid #E0E3E7',
//                     borderRadius: '8px'
//                   }}>
//                     <table style={{
//                       width: '100%',
//                       borderCollapse: 'collapse'
//                     }}>
//                       <thead>
//                         <tr style={{
//                           backgroundColor: '#F1F2F6',
//                           position: 'sticky',
//                           top: '0'
//                         }}>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Detection</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Confidence</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#57606F',
//                             fontWeight: '500'
//                           }}>Dimensions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {predictions.map((pred, i) => (
//                           <tr key={i} style={{
//                             borderBottom: '1px solid #E0E3E7',
//                             ':last-child': {
//                               borderBottom: 'none'
//                             }
//                           }}>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#2ED573',
//                               fontWeight: '500',
//                               textTransform: 'capitalize'
//                             }}>
//                               {pred.class}
//                             </td>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: '#2F3542'
//                             }}>
//                               {Math.round(pred.confidence * 100)}%
//                             </td>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: '#57606F',
//                               fontSize: '14px'
//                             }}>
//                               {Math.round(pred.width)}×{Math.round(pred.height)}px
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Caries_detection;


// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "TjdtkHlfpVQOoG1DqyeY";
//   const MODEL_URL = "dental-caries-detection-using-dl-p9krw/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       preds.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#64FFDA';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         ctx.fillStyle = color;
//         ctx.globalAlpha = 0.8;
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
//         ctx.globalAlpha = 1.0;
        
//         ctx.fillStyle = '#0A192F';
//         ctx.font = 'bold 12px "Segoe UI", sans-serif';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//       drawOnCanvas(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = '';
//   };

//   return (
//     <div style={{
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '40px',
//       fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
//       backgroundColor: '#0A192F',
//       minHeight: '100vh',
//       color: '#CCD6F6'
//     }}>
//       <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
//         <header style={{
//           marginBottom: '40px',
//           textAlign: 'center',
//           borderBottom: '1px solid #233554',
//           paddingBottom: '20px'
//         }}>
//           <h1 style={{ 
//             color: '#E6F1FF',
//             fontWeight: '600',
//             fontSize: '2.2rem',
//             marginBottom: '10px'
//           }}>
//             Caries Detection Model
//           </h1>
//           <p style={{
//             color: '#8892B0',
//             fontSize: '1.1rem',
//             maxWidth: '700px',
//             margin: '0 auto',
//             lineHeight: '1.6'
//           }}>
//             Advanced AI-powered detection of dental caries with precision visualization
//           </p>
//         </header>
        
//         <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
//           {/* Left Column - Controls */}
//           <div style={{ flex: '1', minWidth: '300px' }}>
//             <div style={{
//               backgroundColor: '#112240',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 10px 30px -15px rgba(2,12,27,0.7)',
//               height: '100%'
//             }}>
//               <h3 style={{
//                 color: '#E6F1FF',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#64FFDA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Image Controls
//               </h3>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 style={{ display: 'none' }}
//               />
              
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 style={{
//                   width: '100%',
//                   padding: '15px',
//                   backgroundColor: '#64FFDA',
//                   color: '#0A192F',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '500',
//                   marginBottom: '15px',
//                   transition: 'all 0.3s ease',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px'
//                 }}
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 13V5H11V13H5L12 20L19 13H13Z" fill="#0A192F"/>
//                 </svg>
//                 {image ? 'Change Dental Image' : 'Upload Dental Image'}
//               </button>
              
//               {image && (
//                 <button
//                   onClick={detectCaries}
//                   disabled={loading}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: loading ? '#495670' : '#64FFDA',
//                     color: '#0A192F',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     marginBottom: '25px',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
//                         <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="#0A192F" strokeWidth="2" strokeLinecap="round"/>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M8 12H16M12 16V8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                       Detect Caries
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {error && (
//                 <div style={{
//                   padding: '15px',
//                   backgroundColor: '#FF6B81',
//                   color: 'white',
//                   borderRadius: '8px',
//                   marginBottom: '25px',
//                   fontSize: '14px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px'
//                 }}>
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   {error}
//                 </div>
//               )}
              
//               {(image || predictions.length > 0) && (
//                 <button
//                   onClick={clearData}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: '#FF4757',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   Clear All Data
//                 </button>
//               )}
//             </div>
//           </div>
          
//           {/* Right Column - Results */}
//           <div style={{ flex: '2', minWidth: '400px' }}>
//             <div style={{
//               backgroundColor: '#112240',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 10px 30px -15px rgba(2,12,27,0.7)'
//             }}>
//               <h3 style={{
//                 color: '#E6F1FF',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#64FFDA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Detection Results
//               </h3>
              
//               <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//                 {image ? (
//                   <canvas
//                     ref={canvasRef}
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '400px',
//                       borderRadius: '8px',
//                       backgroundColor: '#0A192F',
//                       border: '1px solid #233554'
//                     }}
//                   />
//                 ) : (
//                   <div style={{
//                     backgroundColor: '#0A192F',
//                     borderRadius: '8px',
//                     padding: '60px 20px',
//                     border: '1px dashed #233554',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     minHeight: '300px'
//                   }}>
//                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
//                       <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46972 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#8892B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     <p style={{ color: '#8892B0', marginTop: '15px', fontSize: '16px' }}>
//                       Upload a dental image to begin analysis
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {predictions.length > 0 && (
//                 <div>
//                   <div style={{ 
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     marginBottom: '20px',
//                     flexWrap: 'wrap',
//                     gap: '15px'
//                   }}>
//                     <div style={{
//                       backgroundColor: '#0A192F',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px',
//                       border: '1px solid #233554'
//                     }}>
//                       <div style={{ color: '#8892B0', fontSize: '14px', marginBottom: '5px' }}>
//                         Total Detections
//                       </div>
//                       <div style={{ color: '#64FFDA', fontSize: '24px', fontWeight: '600' }}>
//                         {predictions.length}
//                       </div>
//                     </div>
                    
//                     <div style={{
//                       backgroundColor: '#0A192F',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px',
//                       border: '1px solid #233554'
//                     }}>
//                       <div style={{ color: '#8892B0', fontSize: '14px', marginBottom: '5px' }}>
//                         Cavities Found
//                       </div>
//                       <div style={{ color: '#FF4757', fontSize: '24px', fontWeight: '600' }}>
//                         {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     maxHeight: '300px',
//                     overflowY: 'auto',
//                     border: '1px solid #233554',
//                     borderRadius: '8px'
//                   }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                       <thead>
//                         <tr style={{ backgroundColor: '#0A192F', position: 'sticky', top: '0' }}>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Detection</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Confidence</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Dimensions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {predictions.map((pred, i) => (
//                           <tr key={i} style={{ borderBottom: '1px solid #233554' }}>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#64FFDA',
//                               fontWeight: '500',
//                               textTransform: 'capitalize'
//                             }}>
//                               {pred.class}
//                             </td>
//                             <td style={{ padding: '12px 15px', color: '#E6F1FF' }}>
//                               {Math.round(pred.confidence * 100)}%
//                             </td>
//                             <td style={{ padding: '12px 15px', color: '#8892B0', fontSize: '14px' }}>
//                               {Math.round(pred.width)}×{Math.round(pred.height)}px
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Caries_detection;



// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const CariesDetection = () => {
//   // State management
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Refs
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "TjdtkHlfpVQOoG1DqyeY";
//   const MODEL_URL = "dental-caries-3wij1-fybjn/1";

//   // Load saved data from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes on canvas
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       // Set canvas dimensions to match image
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       // Clear and draw image
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       // Draw each prediction
//       preds.forEach(pred => {
//         // Color coding based on detection class
//         const colorMap = {
//           'caries': '#FF4757',      // Red for caries
//           'early_caries': '#FFA502', // Orange for early caries
//           'sound': '#2ED573'         // Green for healthy teeth
//         };
        
//         const color = colorMap[pred.class] || '#64FFDA';
//         const label = `${pred.class.replace('_', ' ')} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         // Draw bounding box
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         // Draw label background
//         ctx.fillStyle = color;
//         ctx.globalAlpha = 0.8;
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
//         ctx.globalAlpha = 1.0;
        
//         // Draw label text
//         ctx.fillStyle = '#0A192F';
//         ctx.font = 'bold 12px "Segoe UI", sans-serif';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Persist data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   // Handle image upload
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Send image to Roboflow for detection
//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       // Extract base64 data (remove data URL prefix)
//       const base64Data = image.split(',')[1];
      
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,  // Minimum confidence threshold (50%)
//             overlap: 30      // Maximum overlap between boxes (30%)
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000      // 30 second timeout
//         }
//       );

//       if (!response.data?.predictions) {
//         throw new Error("No predictions returned from model");
//       }

//       // Process predictions to ensure consistent format
//       const processedPredictions = response.data.predictions.map(pred => ({
//         ...pred,
//         class: pred.class.toLowerCase(),  // Normalize class names
//         x: pred.x - pred.width / 2,      // Convert center coords to top-left
//         y: pred.y - pred.height / 2
//       }));

//       setPredictions(processedPredictions);
//     } catch (err) {
//       setError(
//         err.response?.data?.error || 
//         err.message || 
//         "Failed to detect caries. Please try again."
//       );
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset all data
//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Calculate detection statistics
//   const totalDetections = predictions.length;
//   const cavitiesCount = predictions.filter(p => p.class.includes('caries')).length;

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>Dental Caries Detection</h1>
//         <p>AI-powered detection of dental caries with precision visualization</p>
//       </header>

//       <div className="main-content">
//         {/* Controls Panel */}
//         <div className="controls-panel">
//           <h2>
//             <span className="accent-bar"></span>
//             Image Controls
//           </h2>
          
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleImageUpload}
//             accept="image/*"
//             className="hidden-input"
//           />
          
//           <button
//             onClick={() => fileInputRef.current.click()}
//             className="upload-btn"
//           >
//             <UploadIcon />
//             {image ? 'Change Dental Image' : 'Upload Dental Image'}
//           </button>
          
//           {image && (
//             <button
//               onClick={detectCaries}
//               disabled={loading}
//               className={`detect-btn ${loading ? 'loading' : ''}`}
//             >
//               {loading ? (
//                 <>
//                   <LoadingIcon />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <DetectIcon />
//                   Detect Caries
//                 </>
//               )}
//             </button>
//           )}
          
//           {error && (
//             <div className="error-message">
//               <ErrorIcon />
//               {error}
//             </div>
//           )}
          
//           {(image || predictions.length > 0) && (
//             <button
//               onClick={clearData}
//               className="clear-btn"
//             >
//               <ClearIcon />
//               Clear All Data
//             </button>
//           )}
//         </div>
        
//         {/* Results Panel */}
//         <div className="results-panel">
//           <h2>
//             <span className="accent-bar"></span>
//             Detection Results
//           </h2>
          
//           <div className="canvas-container">
//             {image ? (
//               <canvas
//                 ref={canvasRef}
//                 className="detection-canvas"
//               />
//             ) : (
//               <div className="empty-state">
//                 <ImagePlaceholderIcon />
//                 <p>Upload a dental image to begin analysis</p>
//               </div>
//             )}
//           </div>
          
//           {predictions.length > 0 && (
//             <div className="results-details">
//               <div className="stats-container">
//                 <div className="stat-box">
//                   <div className="stat-label">Total Detections</div>
//                   <div className="stat-value">{totalDetections}</div>
//                 </div>
                
//                 <div className="stat-box">
//                   <div className="stat-label">Cavities Found</div>
//                   <div className="stat-value cavities">{cavitiesCount}</div>
//                 </div>
//               </div>
              
//               <div className="predictions-table-container">
//                 <table className="predictions-table">
//                   <thead>
//                     <tr>
//                       <th>Detection</th>
//                       <th>Confidence</th>
//                       <th>Dimensions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {predictions.map((pred, i) => (
//                       <tr key={i}>
//                         <td className={`pred-class ${pred.class.includes('caries') ? 
//                           (pred.class.includes('early') ? 'early-caries' : 'caries') : 'sound'}`}>
//                           {pred.class.replace('_', ' ')}
//                         </td>
//                         <td>{Math.round(pred.confidence * 100)}%</td>
//                         <td>{Math.round(pred.width)}×{Math.round(pred.height)}px</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CSS Styles */}
//       <style jsx>{`
//         .app-container {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 40px;
//           font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
//           background-color: #0A192F;
//           min-height: 100vh;
//           color: #CCD6F6;
//         }
        
//         .app-header {
//           margin-bottom: 40px;
//           text-align: center;
//           border-bottom: 1px solid #233554;
//           padding-bottom: 20px;
//         }
        
//         .app-header h1 {
//           color: #E6F1FF;
//           font-weight: 600;
//           font-size: 2.2rem;
//           margin-bottom: 10px;
//         }
        
//         .app-header p {
//           color: #8892B0;
//           font-size: 1.1rem;
//           max-width: 700px;
//           margin: 0 auto;
//           line-height: 1.6;
//         }
        
//         .main-content {
//           display: flex;
//           gap: 30px;
//           flex-wrap: wrap;
//         }
        
//         .controls-panel, .results-panel {
//           background-color: #112240;
//           border-radius: 12px;
//           padding: 30px;
//           box-shadow: 0 10px 30px -15px rgba(2,12,27,0.7);
//         }
        
//         .controls-panel {
//           flex: 1;
//           min-width: 300px;
//           height: 100%;
//         }
        
//         .results-panel {
//           flex: 2;
//           min-width: 400px;
//         }
        
//         h2 {
//           color: #E6F1FF;
//           font-size: 1.3rem;
//           margin-top: 0;
//           margin-bottom: 25px;
//           font-weight: 600;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }
        
//         .accent-bar {
//           display: inline-block;
//           width: 8px;
//           height: 25px;
//           background-color: #64FFDA;
//           border-radius: 4px;
//         }
        
//         .hidden-input {
//           display: none;
//         }
        
//         button {
//           width: 100%;
//           padding: 15px;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//           font-size: 16px;
//           font-weight: 500;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//         }
        
//         .upload-btn {
//           background-color: #64FFDA;
//           color: #0A192F;
//           margin-bottom: 15px;
//         }
        
//         .detect-btn {
//           background-color: #64FFDA;
//           color: #0A192F;
//           margin-bottom: 25px;
//         }
        
//         .detect-btn.loading {
//           background-color: #495670;
//           cursor: not-allowed;
//         }
        
//         .clear-btn {
//           background-color: #FF4757;
//           color: white;
//         }
        
//         .error-message {
//           padding: 15px;
//           background-color: #FF6B81;
//           color: white;
//           border-radius: 8px;
//           margin-bottom: 25px;
//           font-size: 14px;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }
        
//         .canvas-container {
//           text-align: center;
//           margin-bottom: 30px;
//         }
        
//         .detection-canvas {
//           max-width: 100%;
//           max-height: 400px;
//           border-radius: 8px;
//           background-color: #0A192F;
//           border: 1px solid #233554;
//         }
        
//         .empty-state {
//           background-color: #0A192F;
//           border-radius: 8px;
//           padding: 60px 20px;
//           border: 1px dashed #233554;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 300px;
//         }
        
//         .empty-state p {
//           color: #8892B0;
//           margin-top: 15px;
//           font-size: 16px;
//         }
        
//         .stats-container {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//           gap: 15px;
//         }
        
//         .stat-box {
//           background-color: #0A192F;
//           padding: 15px;
//           border-radius: 8px;
//           flex: 1;
//           min-width: 200px;
//           border: 1px solid #233554;
//         }
        
//         .stat-label {
//           color: #8892B0;
//           font-size: 14px;
//           margin-bottom: 5px;
//         }
        
//         .stat-value {
//           color: #64FFDA;
//           font-size: 24px;
//           font-weight: 600;
//         }
        
//         .stat-value.cavities {
//           color: #FF4757;
//         }
        
//         .predictions-table-container {
//           max-height: 300px;
//           overflow-y: auto;
//           border: 1px solid #233554;
//           border-radius: 8px;
//         }
        
//         .predictions-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
        
//         .predictions-table th {
//           padding: 12px 15px;
//           text-align: left;
//           font-size: 14px;
//           color: #64FFDA;
//           font-weight: 500;
//           border-bottom: 1px solid #233554;
//           background-color: #0A192F;
//           position: sticky;
//           top: 0;
//         }
        
//         .predictions-table td {
//           padding: 12px 15px;
//           border-bottom: 1px solid #233554;
//         }
        
//         .pred-class {
//           font-weight: 500;
//           text-transform: capitalize;
//         }
        
//         .pred-class.caries {
//           color: #FF4757;
//         }
        
//         .pred-class.early-caries {
//           color: #FFA502;
//         }
        
//         .pred-class.sound {
//           color: #64FFDA;
//         }
        
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// // SVG Icons as separate components
// const UploadIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 13V5H11V13H5L12 20L19 13H13Z" fill="#0A192F"/>
//   </svg>
// );

// const DetectIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M8 12H16M12 16V8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

// const LoadingIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
//     <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="#0A192F" strokeWidth="2" strokeLinecap="round"/>
//   </svg>
// );

// const ErrorIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

// const ClearIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

// const ImagePlaceholderIcon = () => (
//   <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
//     <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46972 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#8892B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

// export default CariesDetection;



// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const Caries_detection = () => {
//   const [image, setImage] = useState(null);
//   const [predictions, setPredictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Roboflow configuration
//   const API_KEY = "TjdtkHlfpVQOoG1DqyeY";
//   const MODEL_URL = "dental-caries-3wij1-fybjn/1";

//   // Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('cariesDetectionData');
//     if (savedData) {
//       try {
//         const { savedImage, savedPredictions } = JSON.parse(savedData);
//         if (savedImage) {
//           setImage(savedImage);
//           setPredictions(savedPredictions || []);
//         }
//       } catch (e) {
//         console.error("Failed to parse saved data:", e);
//       }
//     }
//   }, []);

//   // Draw image and bounding boxes
//   const drawOnCanvas = useCallback((imgSrc, preds = []) => {
//     const canvas = canvasRef.current;
//     if (!canvas || !imgSrc) return;

//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
      
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);

//       preds.forEach(pred => {
//         const color = pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#64FFDA';
//         const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
//         const textWidth = ctx.measureText(label).width;

//         ctx.strokeStyle = color;
//         ctx.lineWidth = 2;
//         ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
        
//         ctx.fillStyle = color;
//         ctx.globalAlpha = 0.8;
//         ctx.fillRect(pred.x - 2, pred.y - 20, textWidth + 10, 20);
//         ctx.globalAlpha = 1.0;
        
//         ctx.fillStyle = '#0A192F';
//         ctx.font = 'bold 12px "Segoe UI", sans-serif';
//         ctx.fillText(label, pred.x + 3, pred.y - 7);
//       });
//     };

//     img.src = imgSrc;
//   }, []);

//   // Redraw canvas when image or predictions change
//   useEffect(() => {
//     drawOnCanvas(image, predictions);
//   }, [image, predictions, drawOnCanvas]);

//   // Save data to localStorage
//   useEffect(() => {
//     if (image) {
//       localStorage.setItem(
//         'cariesDetectionData',
//         JSON.stringify({
//           savedImage: image,
//           savedPredictions: predictions
//         })
//       );
//     }
//   }, [image, predictions]);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setImage(event.target.result);
//       setPredictions([]);
//       setError(null);
//       drawOnCanvas(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const detectCaries = async () => {
//     if (!image) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const base64Data = image.split(',')[1];
//       const response = await axios.post(
//         MODEL_URL,
//         base64Data,
//         {
//           params: { 
//             api_key: API_KEY,
//             confidence: 50,
//             overlap: 30
//           },
//           headers: { 
//             "Content-Type": "application/x-www-form-urlencoded" 
//           },
//           timeout: 30000
//         }
//       );

//       if (!response.data || !response.data.predictions) {
//         throw new Error("Invalid response format");
//       }

//       setPredictions(response.data.predictions);
//     } catch (err) {
//       setError(err.response?.data?.error || "Detection failed. Please try again.");
//       console.error("Detection error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearData = () => {
//     localStorage.removeItem('cariesDetectionData');
//     setImage(null);
//     setPredictions([]);
//     setError(null);
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//     fileInputRef.current.value = '';
//   };

//   return (
//     <div style={{
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '40px',
//       fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
//       backgroundColor: '#0A192F',
//       minHeight: '100vh',
//       color: '#CCD6F6'
//     }}>
//       <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
//         <header style={{
//           marginBottom: '40px',
//           textAlign: 'center',
//           borderBottom: '1px solid #233554',
//           paddingBottom: '20px'
//         }}>
//           <h1 style={{ 
//             color: '#E6F1FF',
//             fontWeight: '600',
//             fontSize: '2.2rem',
//             marginBottom: '10px'
//           }}>
//             Caries Detection Model
//           </h1>
//           <p style={{
//             color: '#8892B0',
//             fontSize: '1.1rem',
//             maxWidth: '700px',
//             margin: '0 auto',
//             lineHeight: '1.6'
//           }}>
//             Advanced AI-powered detection of dental caries with precision visualization
//           </p>
//         </header>
        
//         <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
//           {/* Left Column - Controls */}
//           <div style={{ flex: '1', minWidth: '300px' }}>
//             <div style={{
//               backgroundColor: '#112240',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 10px 30px -15px rgba(2,12,27,0.7)',
//               height: '100%'
//             }}>
//               <h3 style={{
//                 color: '#E6F1FF',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#64FFDA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Image Controls
//               </h3>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 style={{ display: 'none' }}
//               />
              
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 style={{
//                   width: '100%',
//                   padding: '15px',
//                   backgroundColor: '#64FFDA',
//                   color: '#0A192F',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '500',
//                   marginBottom: '15px',
//                   transition: 'all 0.3s ease',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '8px'
//                 }}
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19ZM13 13V5H11V13H5L12 20L19 13H13Z" fill="#0A192F"/>
//                 </svg>
//                 {image ? 'Change Dental Image' : 'Upload Dental Image'}
//               </button>
              
//               {image && (
//                 <button
//                   onClick={detectCaries}
//                   disabled={loading}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: loading ? '#495670' : '#64FFDA',
//                     color: '#0A192F',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     marginBottom: '25px',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
//                         <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="#0A192F" strokeWidth="2" strokeLinecap="round"/>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M8 12H16M12 16V8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                       Detect Caries
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {error && (
//                 <div style={{
//                   padding: '15px',
//                   backgroundColor: '#FF6B81',
//                   color: 'white',
//                   borderRadius: '8px',
//                   marginBottom: '25px',
//                   fontSize: '14px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px'
//                 }}>
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   {error}
//                 </div>
//               )}
              
//               {(image || predictions.length > 0) && (
//                 <button
//                   onClick={clearData}
//                   style={{
//                     width: '100%',
//                     padding: '15px',
//                     backgroundColor: '#FF4757',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontSize: '16px',
//                     fontWeight: '500',
//                     transition: 'all 0.3s ease',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                   Clear All Data
//                 </button>
//               )}
//             </div>
//           </div>
          
//           {/* Right Column - Results */}
//           <div style={{ flex: '2', minWidth: '400px' }}>
//             <div style={{
//               backgroundColor: '#112240',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 10px 30px -15px rgba(2,12,27,0.7)'
//             }}>
//               <h3 style={{
//                 color: '#E6F1FF',
//                 fontSize: '1.3rem',
//                 marginTop: '0',
//                 marginBottom: '25px',
//                 fontWeight: '600',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px'
//               }}>
//                 <span style={{
//                   display: 'inline-block',
//                   width: '8px',
//                   height: '25px',
//                   backgroundColor: '#64FFDA',
//                   borderRadius: '4px'
//                 }}></span>
//                 Detection Results
//               </h3>
              
//               <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//                 {image ? (
//                   <canvas
//                     ref={canvasRef}
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '400px',
//                       borderRadius: '8px',
//                       backgroundColor: '#0A192F',
//                       border: '1px solid #233554'
//                     }}
//                   />
//                 ) : (
//                   <div style={{
//                     backgroundColor: '#0A192F',
//                     borderRadius: '8px',
//                     padding: '60px 20px',
//                     border: '1px dashed #233554',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     minHeight: '300px'
//                   }}>
//                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
//                       <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46972 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#8892B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     <p style={{ color: '#8892B0', marginTop: '15px', fontSize: '16px' }}>
//                       Upload a dental image to begin analysis
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {predictions.length > 0 && (
//                 <div>
//                   <div style={{ 
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     marginBottom: '20px',
//                     flexWrap: 'wrap',
//                     gap: '15px'
//                   }}>
//                     <div style={{
//                       backgroundColor: '#0A192F',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px',
//                       border: '1px solid #233554'
//                     }}>
//                       <div style={{ color: '#8892B0', fontSize: '14px', marginBottom: '5px' }}>
//                         Total Detections
//                       </div>
//                       <div style={{ color: '#64FFDA', fontSize: '24px', fontWeight: '600' }}>
//                         {predictions.length}
//                       </div>
//                     </div>
                    
//                     <div style={{
//                       backgroundColor: '#0A192F',
//                       padding: '15px',
//                       borderRadius: '8px',
//                       flex: '1',
//                       minWidth: '200px',
//                       border: '1px solid #233554'
//                     }}>
//                       <div style={{ color: '#8892B0', fontSize: '14px', marginBottom: '5px' }}>
//                         Cavities Found
//                       </div>
//                       <div style={{ color: '#FF4757', fontSize: '24px', fontWeight: '600' }}>
//                         {predictions.filter(p => p.class.toLowerCase().includes('cavity')).length}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     maxHeight: '300px',
//                     overflowY: 'auto',
//                     border: '1px solid #233554',
//                     borderRadius: '8px'
//                   }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                       <thead>
//                         <tr style={{ backgroundColor: '#0A192F', position: 'sticky', top: '0' }}>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Detection</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Confidence</th>
//                           <th style={{
//                             padding: '12px 15px',
//                             textAlign: 'left',
//                             fontSize: '14px',
//                             color: '#64FFDA',
//                             fontWeight: '500',
//                             borderBottom: '1px solid #233554'
//                           }}>Dimensions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {predictions.map((pred, i) => (
//                           <tr key={i} style={{ borderBottom: '1px solid #233554' }}>
//                             <td style={{
//                               padding: '12px 15px',
//                               color: pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#64FFDA',
//                               fontWeight: '500',
//                               textTransform: 'capitalize'
//                             }}>
//                               {pred.class}
//                             </td>
//                             <td style={{ padding: '12px 15px', color: '#E6F1FF' }}>
//                               {Math.round(pred.confidence * 100)}%
//                             </td>
//                             <td style={{ padding: '12px 15px', color: '#8892B0', fontSize: '14px' }}>
//                               {Math.round(pred.width)}×{Math.round(pred.height)}px
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Caries_detection;




import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const Caries_detection = () => {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'healthy', 'error', 'unknown'
  const [modelInfo, setModelInfo] = useState(null);
  const [severityAssessment, setSeverityAssessment] = useState(null);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState([]);
  const [processingTime, setProcessingTime] = useState(null);
  const [imageType, setImageType] = useState('xray'); // X-ray only mode
  const [xrayApiStatus, setXrayApiStatus] = useState('unknown');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // X-ray Dental Cavity Detection Model configuration
  // Replace these URLs with your actual ngrok URLs from the X-ray Colab notebook
  // When API is unavailable, the app automatically falls back to enhanced demo data
  const MODEL_URL = "http://localhost:5000/api/v1/predict-xray";
  const HEALTH_URL = "http://localhost:5000/api/v1/health";
  const MODEL_INFO_URL = "http://localhost:5000/api/v1/model-info";

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('cariesDetectionData');
    if (savedData) {
      try {
        const { savedImage, savedPredictions } = JSON.parse(savedData);
        if (savedImage) {
          setImage(savedImage);
          setPredictions(savedPredictions || []);
        }
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
  }, []);

  // Draw image and bounding boxes
  const drawOnCanvas = useCallback((imgSrc, preds = []) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Maintain aspect ratio but limit size
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      // Calculate scale factors
      const scaleX = width / img.width;
      const scaleY = height / img.height;

      preds.forEach(pred => {
        const color = pred.class.toLowerCase().includes('cavity') ? '#FF4757' : '#64FFDA';
        const label = `${pred.class} ${Math.round(pred.confidence * 100)}%`;
        
        // Scale coordinates and dimensions
        const x = pred.x * scaleX;
        const y = pred.y * scaleY;
        const width = pred.width * scaleX;
        const height = pred.height * scaleY;

        // Draw segmentation mask if available
        if (pred.polygon && pred.polygon.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 2;
          
          // Draw polygon from scaled points
          const scaledPolygon = pred.polygon.map((point, index) => 
            index % 2 === 0 ? point * scaleX : point * scaleY
          );
          
          ctx.moveTo(scaledPolygon[0], scaledPolygon[1]);
          for (let i = 2; i < scaledPolygon.length; i += 2) {
            ctx.lineTo(scaledPolygon[i], scaledPolygon[i + 1]);
          }
          ctx.closePath();
          
          // Fill mask with transparency
          ctx.globalAlpha = 0.3;
          ctx.fill();
          
          // Draw outline
          ctx.globalAlpha = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else {
          // Fallback to bounding box if no segmentation data
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
        }
        
        // Draw label background
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x - 2, y - 20, ctx.measureText(label).width + 10, 20);
        ctx.globalAlpha = 1.0;
        
        // Draw label text
        ctx.fillStyle = '#0A192F';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillText(label, x + 3, y - 7);
      });
    };

    img.src = imgSrc;
  }, []);

  // Redraw canvas when image or predictions change
  useEffect(() => {
    drawOnCanvas(image, predictions);
  }, [image, predictions, drawOnCanvas]);

  // Save data to localStorage
  useEffect(() => {
    if (image) {
      localStorage.setItem(
        'cariesDetectionData',
        JSON.stringify({
          savedImage: image,
          savedPredictions: predictions
        })
      );
    }
  }, [image, predictions]);

  // X-ray image validation function
  const validateXrayImage = (imageData, fileName) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas to analyze image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Basic validation checks
          const validationResults = {
            isValid: true,
            errors: []
          };
          
          // 1. Check image dimensions (X-rays typically have specific aspect ratios)
          const aspectRatio = img.width / img.height;
          if (img.width < 200 || img.height < 200) {
            validationResults.isValid = false;
            validationResults.errors.push('Image resolution too low for X-ray analysis (minimum 200x200)');
          }
          
          // 2. Check if image is predominantly grayscale (X-rays are grayscale)
          let colorVariance = 0;
          let totalPixels = 0;
          let grayPixels = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if pixel is grayscale (R, G, B values are similar)
            const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
            if (maxDiff < 30) { // Allow some tolerance for compression artifacts
              grayPixels++;
            }
            totalPixels++;
            
            colorVariance += maxDiff;
          }
          
          const grayPercentage = (grayPixels / totalPixels) * 100;
          if (grayPercentage < 70) {
            validationResults.isValid = false;
            validationResults.errors.push('Image appears to be colored. X-ray images should be grayscale');
          }
          
          // 3. Check brightness distribution (X-rays have specific brightness patterns)
          let darkPixels = 0;
          let brightPixels = 0;
          let midTonePixels = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 85) darkPixels++;
            else if (brightness > 170) brightPixels++;
            else midTonePixels++;
          }
          
          const darkPercentage = (darkPixels / totalPixels) * 100;
          const brightPercentage = (brightPixels / totalPixels) * 100;
          
          // X-rays typically have significant dark areas (background) and some bright areas (bones/teeth)
          if (darkPercentage < 20) {
            validationResults.isValid = false;
            validationResults.errors.push('Image lacks typical X-ray contrast patterns');
          }
          
          // 4. Check for typical X-ray characteristics in filename
          const fileName_lower = fileName.toLowerCase();
          const suspiciousTerms = ['screenshot', 'photo', 'selfie', 'camera', 'phone', 'drawing', 'cartoon', 'fake'];
          const xrayTerms = ['xray', 'x-ray', 'radiograph', 'dental', 'tooth', 'oral'];
          
          const hasSuspiciousTerms = suspiciousTerms.some(term => fileName_lower.includes(term));
          if (hasSuspiciousTerms) {
            validationResults.isValid = false;
            validationResults.errors.push('Filename suggests this is not a genuine X-ray image');
          }
          
          // 5. Check for extremely uniform areas (might indicate fake/generated images)
          let uniformAreas = 0;
          const sampleSize = Math.min(1000, Math.floor(data.length / 16)); // Sample pixels
          
          for (let i = 0; i < sampleSize; i++) {
            const pixelIndex = i * 16;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            
            // Check surrounding pixels for uniformity
            let uniformCount = 0;
            for (let j = 1; j <= 4 && pixelIndex + j * 4 < data.length; j++) {
              const nr = data[pixelIndex + j * 4];
              const ng = data[pixelIndex + j * 4 + 1];
              const nb = data[pixelIndex + j * 4 + 2];
              
              if (Math.abs(r - nr) < 5 && Math.abs(g - ng) < 5 && Math.abs(b - nb) < 5) {
                uniformCount++;
              }
            }
            
            if (uniformCount >= 3) uniformAreas++;
          }
          
          const uniformPercentage = (uniformAreas / sampleSize) * 100;
          if (uniformPercentage > 80) {
            validationResults.isValid = false;
            validationResults.errors.push('Image appears artificially uniform, not typical of real X-ray images');
          }
          
          if (validationResults.isValid) {
            resolve(true);
          } else {
            reject(new Error(`❌ Invalid X-ray Image: ${validationResults.errors.join('. ')}`));
          }
          
        } catch (error) {
          reject(new Error('❌ Failed to analyze image: ' + error.message));
        }
      };
      
      img.onerror = () => {
        reject(new Error('❌ Failed to load image for validation'));
      };
      
      img.src = imageData;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Basic file validation
      if (!file.type.match('image.*')) {
        throw new Error('❌ Please upload an image file');
      }

      // Validate image size (max 10MB for X-rays)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('❌ Image size should be less than 10MB');
      }

      // Check file format (prefer medical imaging formats)
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
      if (!allowedFormats.includes(file.type)) {
        throw new Error('❌ Please upload a JPEG, PNG, BMP, or TIFF image file');
      }

      // Read file for validation
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Validate if it's a real X-ray image
          await validateXrayImage(event.target.result, file.name);
          
          // If validation passes, set the image
          setImage(event.target.result);
          setPredictions([]);
          setError(null);
          setLoading(false);
          
        } catch (validationError) {
          setError(validationError.message);
          setImage(null);
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('❌ Failed to read the uploaded file');
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const detectCaries = async () => {
    if (!image) return;

    // Prevent multiple simultaneous requests
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      
      const requestData = {
        image: base64Data,
        confidence: 0.4,
        include_severity: true,
        include_recommendations: true,
        image_type: 'xray',
        enhance_contrast: true,
        clinical_analysis: true
      };
      
      const response = await axios({
        method: "POST",
        url: MODEL_URL,
        data: requestData,
        headers: { 
          "Content-Type": "application/json" 
        },
        timeout: 45000
      });

      if (!response.data || !response.data.predictions) {
        throw new Error("Invalid response format");
      }

      // The new advanced API returns enhanced predictions with severity and recommendations
      const formattedPredictions = response.data.predictions.map(pred => ({
        ...pred,
        // Ensure we have the segmentation data
        mask: pred.mask || null,
        polygon: pred.polygon || null,
        // Enhanced classification with severity
        class: pred.class || 'cavity',
        severity: pred.severity || 'unknown',
        confidence: pred.confidence || 0,
        // Additional metadata
        area: pred.area || 0,
        perimeter: pred.perimeter || 0
      }));

      setPredictions(formattedPredictions);
      
      // Set new advanced features
      if (response.data.severity_assessment) {
        setSeverityAssessment(response.data.severity_assessment);
      }
      
      if (response.data.treatment_recommendations) {
        setTreatmentRecommendations(response.data.treatment_recommendations);
      }
      
      if (response.data.processing_time) {
        setProcessingTime(response.data.processing_time);
      }
      
      // Update model info
      if (response.data.model_info) {
        setModelInfo(response.data.model_info);
        console.log("Advanced Model Info:", response.data.model_info);
      }
      
    } catch (err) {
      console.error("Detection error:", err);
      
      // Clear any previous results
      setPredictions([]);
      setSeverityAssessment(null);
      setTreatmentRecommendations([]);
      setProcessingTime(0);
      setModelInfo(null);
      
      // Show proper error message based on the error type
      let errorMessage = "❌ Cavities Detection Failed: ";
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage += "Unable to connect to the AI model server. Please ensure the API server is running on port 5000.";
      } else if (err.response && err.response.status === 500) {
        errorMessage += "Internal server error occurred. Please check the server logs and try again.";
      } else if (err.response && err.response.status === 400) {
        errorMessage += "Invalid image format or request. Please try uploading a different X-ray image.";
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage += "Request timed out. The server may be overloaded or not responding.";
      } else {
        errorMessage += `Unexpected error occurred: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Health check function for X-ray API status
  const checkApiHealth = async () => {
    try {
      const response = await axios.get(HEALTH_URL, { timeout: 5000 });
      if (response.data && response.data.status === 'healthy') {
        setXrayApiStatus('healthy');
        return true;
      } else {
        setXrayApiStatus('error');
        return false;
      }
    } catch (err) {
      setXrayApiStatus('error');
      console.warn('X-ray API health check failed:', err.message);
      return false;
    }
  };

  // Function to fetch model information
  const fetchModelInfo = async () => {
    try {
      const response = await axios.get(MODEL_INFO_URL, { timeout: 5000 });
      if (response.data) {
        setModelInfo(response.data);
        console.log('Model info fetched:', response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch model info:", err.message);
    }
  };

  // Check API health and fetch model info on component mount
  useEffect(() => {
    checkApiHealth();
    fetchModelInfo();
  }, []);



  const clearData = () => {
    localStorage.removeItem('cariesDetectionData');
    setImage(null);
    setPredictions([]);
    setError(null);
    setSeverityAssessment(null);
    setTreatmentRecommendations([]);
    setProcessingTime(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      <div className="dashboard-wrapper">
        <div className="container py-4">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="mb-0">
                  <i className="bi bi-robot me-2"></i>
                  X-Ray Dental Cavities Detection
                </h2>
                <div className="d-flex align-items-center gap-2">
                  {/* Model status indicators hidden per user request */}
                </div>
              </div>
              {/* Description text hidden per user request */}
            </div>

            <div className="card-body">
              <div className="row">
                {/* Left Column - Controls */}
                <div className="col-md-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title text-primary">
                        <i className="bi bi-gear-fill me-2"></i>
                        Image Controls
                      </h5>
              
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="fileInput"
                      />
                      
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="btn btn-primary w-100 mb-3"
                      >
                        <i className="bi bi-upload me-2"></i>
                        {image ? 'Change X-Ray Image' : 'Upload X-Ray Image'}
                      </button>
              
              {image && (
                <button
                  onClick={detectCaries}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: loading ? '#495670' : '#64FFDA',
                    color: '#0A192F',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginBottom: '25px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                        <path d="M12 4V6M18 18H20M6 18H4M4 12H6M20 12H18M18 6L20 4M6 6L4 4M12 20V18" stroke="#0A192F" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.46 6.28L11.05 4.69C13.26 2.48 16.76 2.48 18.97 4.69C21.18 6.9 21.18 10.4 18.97 12.61L17.38 14.2M14.54 17.72L12.95 19.31C10.74 21.52 7.24 21.52 5.03 19.31C2.82 17.1 2.82 13.6 5.03 11.39L6.62 9.8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12H16M12 16V8" stroke="#0A192F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Detect Cavities
                    </>
                  )}
                </button>
              )}
              
                      {error && (
                        <div className={`alert ${error.includes('Demo Mode') ? 'alert-info' : 'alert-danger'} d-flex align-items-center mb-3`}>
                          <i className={`bi ${error.includes('Demo Mode') ? 'bi-info-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                          {error}
                        </div>
                      )}
                      
                      {(image || predictions.length > 0) && (
                        <button
                          onClick={clearData}
                          className="btn btn-danger w-100"
                        >
                          <i className="bi bi-trash me-2"></i>
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
          
                {/* Right Column - Results */}
                <div className="col-md-8">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">
                        <i className="bi bi-graph-up me-2"></i>
                        Analysis Results
                      </h5>
                      
                      <div className="text-center mb-4">
                        {image ? (
                          <canvas
                            ref={canvasRef}
                            className="img-fluid border rounded"
                            style={{ maxHeight: '500px' }}
                          />
                        ) : (
                          <div className="border border-2 border-dashed rounded p-5 text-center" style={{ minHeight: '300px' }}>
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                              <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                              <p className="text-muted mt-3 mb-0">
                                Upload an X-ray image to begin analysis
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
              
                      {predictions.length > 0 && (
                        <div>
                          {/* Statistics Cards - Horizontal Layout */}
                          <div className="d-flex flex-wrap gap-4 mb-4 justify-content-center">
                            {/* Removed Total Detections and Cavities Found cards per request */}

                            {/* Processing Time Card */}
                            {processingTime && (
                              <div className="flex-fill" style={{ minWidth: '220px', maxWidth: '320px' }}>
                                <div className="card shadow-lg h-100 stats-card gradient-blue" style={{
                                  borderRadius: '16px',
                                  border: 'none',
                                  color: 'white'
                                }}>
                                  <div className="card-body d-flex align-items-center" style={{ padding: '1.5rem' }}>
                                    <div className="me-3 stats-icon-container">
                                      <i className="bi bi-stopwatch" style={{ 
                                        fontSize: '1.8rem', 
                                        color: 'white'
                                      }}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="stats-subtitle">
                                        Processing Time
                                      </h6>
                                      <h2 className="stats-value">
                                        {typeof processingTime === 'number' ? `${processingTime.toFixed(2)}s` : processingTime}
                                      </h2>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Severity Assessment Section */}
                          {severityAssessment && (
                            <div className="card mb-4">
                              <div className="card-body">
                                <h6 className="card-title text-danger">
                                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                  Severity Assessment
                                </h6>
                                
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="mb-3">
                                      <small className="text-muted">Overall Severity</small>
                                      <div className={`fw-bold ${
                                        severityAssessment.overall_severity === 'severe' ? 'text-danger' : 
                                        severityAssessment.overall_severity === 'moderate' ? 'text-warning' : 'text-success'
                                      }`} style={{ textTransform: 'capitalize' }}>
                                        {severityAssessment.overall_severity}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="col-md-6">
                                    <div className="mb-3">
                                      <small className="text-muted">Risk Score</small>
                                      <div className={`fw-bold ${
                                        severityAssessment.risk_score >= 7 ? 'text-danger' : 
                                        severityAssessment.risk_score >= 4 ? 'text-warning' : 'text-success'
                                      }`}>
                                        {severityAssessment.risk_score}/10
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {severityAssessment.urgency && (
                                  <div>
                                    <small className="text-muted">Urgency Level</small>
                                    <div className={`fw-bold ${
                                      severityAssessment.urgency === 'immediate' ? 'text-danger' : 
                                      severityAssessment.urgency === 'soon' ? 'text-warning' : 'text-success'
                                    }`} style={{ textTransform: 'capitalize' }}>
                                      {severityAssessment.urgency}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                  {/* Clinical Analysis from API */}
                  {severityAssessment && (
                    <div style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #dee2e6',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{
                        color: '#1a3c34',
                        fontSize: '1.1rem',
                        marginTop: '0',
                        marginBottom: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '20px',
                          background: 'linear-gradient(135deg, #4a90e2, #34c759)',
                          borderRadius: '3px'
                        }}></span>
                        Clinical Analysis
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          color: 'white'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', marginBottom: '5px' }}>
                            Severity Level
                          </div>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', textTransform: 'capitalize' }}>
                            {severityAssessment.overall_severity}
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #34c759 0%, #2db54e 100%)',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          color: 'white'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', marginBottom: '5px' }}>
                            Cavity Percentage
                          </div>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                            {severityAssessment.cavity_percentage?.toFixed(1)}%
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #4a90e2 20%, #34c759 80%)',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          color: 'white'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', marginBottom: '5px' }}>
                            Detected Cavities
                          </div>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                            {severityAssessment.num_cavities}
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #357abd 0%, #4a90e2 100%)',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          color: 'white'
                        }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', marginBottom: '5px' }}>
                            Confidence Score
                          </div>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                            {(severityAssessment.confidence_score * 100)?.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {severityAssessment.clinical_notes && (
                        <div style={{
                          backgroundColor: '#f0f4f8',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6'
                        }}>
                          <div style={{ color: '#1a3c34', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                            Clinical Notes
                          </div>
                          <div style={{ color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>
                            {severityAssessment.clinical_notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Treatment Recommendations Section */}
                  {treatmentRecommendations.length > 0 && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #dee2e6',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{
                        color: '#E6F1FF',
                        fontSize: '1.1rem',
                        marginTop: '0',
                        marginBottom: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '20px',
                          backgroundColor: '#64FFDA',
                          borderRadius: '3px'
                        }}></span>
                        Treatment Recommendations
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {treatmentRecommendations.map((recommendation, index) => (
                          <div key={index} style={{
                            backgroundColor: '#112240',
                            padding: '15px',
                            borderRadius: '6px',
                            border: '1px solid #233554'
                          }}>
                            <div style={{
                              color: '#E6F1FF',
                              fontSize: '16px',
                              fontWeight: '500',
                              marginBottom: '8px'
                            }}>
                              {recommendation.treatment}
                            </div>
                            <div style={{
                              color: '#8892B0',
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}>
                              {recommendation.description}
                            </div>
                            {recommendation.priority && (
                              <div style={{
                                marginTop: '8px',
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                backgroundColor: recommendation.priority === 'high' ? '#FF4757' : 
                                                recommendation.priority === 'medium' ? '#FFA502' : '#64FFDA',
                                color: 'white'
                              }}>
                                {recommendation.priority.toUpperCase()} PRIORITY
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Information Section */}
                  {modelInfo && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #dee2e6',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{
                        color: '#1a3c34',
                        fontSize: '1.1rem',
                        marginTop: '0',
                        marginBottom: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '20px',
                          background: 'linear-gradient(135deg, #4a90e2, #34c759)',
                          borderRadius: '3px'
                        }}></span>
                        {modelInfo.name ? `${modelInfo.name} - Model Information` : 'Model Information'}
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#4a90e2',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite',
                          marginLeft: '8px'
                        }}></span>
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {modelInfo.name && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Model Name
                            </div>
                            <div style={{ color: '#1a3c34', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.name}
                            </div>
                          </div>
                        )}
                        
                        {modelInfo.version && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Version
                            </div>
                            <div style={{ color: '#4a90e2', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.version}
                            </div>
                          </div>
                        )}
                        
                        {modelInfo.architecture && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Architecture
                            </div>
                            <div style={{ color: '#1a3c34', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.architecture}
                            </div>
                          </div>
                        )}
                        
                        {modelInfo.accuracy && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Accuracy
                            </div>
                            <div style={{ color: '#34c759', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.accuracy}
                            </div>
                          </div>
                        )}
                        
                        {modelInfo.training_data && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Training Data
                            </div>
                            <div style={{ color: '#1a3c34', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.training_data}
                            </div>
                          </div>
                        )}
                        
                        {modelInfo.last_updated && (
                          <div>
                            <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px', fontWeight: '500' }}>
                              Last Updated
                            </div>
                            <div style={{ color: '#495057', fontSize: '16px', fontWeight: '500' }}>
                              {modelInfo.last_updated}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {modelInfo.capabilities && (
                        <div style={{ marginTop: '15px' }}>
                          <div style={{ color: '#8892B0', fontSize: '14px', marginBottom: '8px' }}>
                            Advanced Capabilities
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {modelInfo.capabilities.map((capability, index) => (
                              <span key={index} style={{
                                backgroundColor: '#112240',
                                color: '#64FFDA',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid #233554'
                              }}>
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                    
                            <div className="table-responsive" style={{ maxHeight: '300px' }}>
                            <table className="table table-striped table-hover">
                              <thead className="table-primary">
                                <tr>
                                  <th>Detection</th>
                                  <th>Confidence</th>
                                  <th>Location</th>
                                </tr>
                              </thead>
                              <tbody>
                                {predictions.map((pred, i) => (
                                  <tr key={i}>
                                    <td className={`fw-bold ${pred.class.toLowerCase().includes('cavity') ? 'text-danger' : 'text-success'}`} style={{ textTransform: 'capitalize' }}>
                                      {pred.class}
                                    </td>
                                    <td>{Math.round(pred.confidence * 100)}%</td>
                                    <td className="text-muted small">
                                      {Math.round(pred.x)}, {Math.round(pred.y)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Caries_detection;