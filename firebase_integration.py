#!/usr/bin/env python3
"""
Firebase integration module for storing AI detection results
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Warning: Firebase Admin SDK not installed. Install with: pip install firebase-admin")

logger = logging.getLogger(__name__)

class FirebaseDetectionStorage:
    """Firebase service for storing and retrieving AI detection results"""
    
    def __init__(self, service_account_path: Optional[str] = None):
        """
        Initialize Firebase connection
        
        Args:
            service_account_path: Path to Firebase service account JSON file
        """
        self.db = None
        self.initialized = False
        
        if not FIREBASE_AVAILABLE:
            logger.warning("Firebase Admin SDK not available")
            return
            
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                if service_account_path and os.path.exists(service_account_path):
                    # Use service account file
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                else:
                    # Use default credentials (for production deployment)
                    firebase_admin.initialize_app()
                
            self.db = firestore.client()
            self.initialized = True
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self.initialized = False

    def is_available(self) -> bool:
        """Check if Firebase is available and initialized"""
        return FIREBASE_AVAILABLE and self.initialized

    def save_detection_result(self, 
                            detection_data: Dict[str, Any], 
                            user_id: str, 
                            user_role: str = 'patient',
                            image_metadata: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Save detection results to Firebase Firestore
        
        Args:
            detection_data: The AI detection results
            user_id: ID of the user who performed the detection
            user_role: Role of the user (patient/dentist/admin)
            image_metadata: Optional metadata about the uploaded image
            
        Returns:
            Document ID if successful, None if failed
        """
        if not self.is_available():
            logger.warning("Firebase not available, skipping save")
            return None
            
        try:
            # Prepare the document data
            doc_data = {
                # User Information
                'userId': user_id,
                'userRole': user_role,
                
                # Image Information
                'imageMetadata': {
                    'fileName': image_metadata.get('fileName', 'unknown') if image_metadata else 'unknown',
                    'fileSize': image_metadata.get('fileSize', 0) if image_metadata else 0,
                    'imageType': image_metadata.get('imageType', 'unknown') if image_metadata else 'unknown',
                    'uploadTimestamp': firestore.SERVER_TIMESTAMP
                },
                
                # AI Model Results
                'predictions': detection_data.get('predictions', []),
                'totalDetections': len(detection_data.get('predictions', [])),
                'cavitiesFound': len([p for p in detection_data.get('predictions', []) 
                                   if 'cavity' in p.get('class', '').lower()]),
                
                # Clinical Analysis
                'clinicalAnalysis': {
                    'severityLevel': detection_data.get('severityAssessment', {}).get('overall_severity', 'unknown'),
                    'cavityPercentage': detection_data.get('severityAssessment', {}).get('cavity_percentage', 0),
                    'confidenceScore': detection_data.get('severityAssessment', {}).get('confidence_score', 0),
                    'urgencyLevel': detection_data.get('severityAssessment', {}).get('urgency', 'routine'),
                    'clinicalNotes': detection_data.get('treatmentRecommendations', {}).get('clinical_notes', []),
                    'recommendations': detection_data.get('treatmentRecommendations', {}).get('recommendations', [])
                },
                
                # Processing Information
                'processingTime': detection_data.get('processingTime', 0),
                'modelInfo': detection_data.get('modelInfo', {}),
                
                # Timestamps
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                
                # Status and Flags
                'status': 'completed',
                'reviewed': False,
                'reviewedBy': None,
                'reviewedAt': None,
                
                # Additional metadata
                'sessionId': detection_data.get('sessionId'),
                'deviceInfo': detection_data.get('deviceInfo')
            }
            
            # Add document to Firestore
            doc_ref = self.db.collection('detectionResults').add(doc_data)
            doc_id = doc_ref[1].id
            
            logger.info(f"Detection result saved to Firebase with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error saving detection result to Firebase: {str(e)}")
            return None

    def get_user_detections(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get detection results for a specific user
        
        Args:
            user_id: User ID
            limit: Maximum number of results to return
            
        Returns:
            List of detection results
        """
        if not self.is_available():
            logger.warning("Firebase not available")
            return []
            
        try:
            docs = (self.db.collection('detectionResults')
                   .where('userId', '==', user_id)
                   .order_by('createdAt', direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
                
            logger.info(f"Retrieved {len(results)} detection results for user {user_id}")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving user detections: {str(e)}")
            return []

    def get_detection_by_id(self, detection_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific detection result by ID
        
        Args:
            detection_id: Detection document ID
            
        Returns:
            Detection result or None if not found
        """
        if not self.is_available():
            logger.warning("Firebase not available")
            return None
            
        try:
            doc = self.db.collection('detectionResults').document(detection_id).get()
            
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            else:
                logger.warning(f"Detection {detection_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving detection {detection_id}: {str(e)}")
            return None

    def update_detection_review(self, 
                              detection_id: str, 
                              reviewer_id: str, 
                              review_data: Dict[str, Any]) -> bool:
        """
        Update detection review status (for dentists/admins)
        
        Args:
            detection_id: Detection document ID
            reviewer_id: ID of the reviewer
            review_data: Review information
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_available():
            logger.warning("Firebase not available")
            return False
            
        try:
            doc_ref = self.db.collection('detectionResults').document(detection_id)
            
            update_data = {
                'reviewed': True,
                'reviewedBy': reviewer_id,
                'reviewedAt': firestore.SERVER_TIMESTAMP,
                'reviewNotes': review_data.get('notes', ''),
                'reviewerVerification': review_data.get('verification', 'pending'),
                'updatedAt': firestore.SERVER_TIMESTAMP
            }
            
            doc_ref.update(update_data)
            logger.info(f"Detection {detection_id} review updated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error updating detection review: {str(e)}")
            return False

    def get_detection_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get detection statistics
        
        Args:
            user_id: Optional user ID to filter by specific user
            
        Returns:
            Statistics dictionary
        """
        if not self.is_available():
            logger.warning("Firebase not available")
            return {}
            
        try:
            query = self.db.collection('detectionResults')
            if user_id:
                query = query.where('userId', '==', user_id)
                
            docs = query.stream()
            
            total_detections = 0
            total_cavities = 0
            severity_counts = {'mild': 0, 'moderate': 0, 'severe': 0}
            
            for doc in docs:
                data = doc.to_dict()
                total_detections += 1
                total_cavities += data.get('cavitiesFound', 0)
                
                severity = data.get('clinicalAnalysis', {}).get('severityLevel', 'mild')
                if severity in severity_counts:
                    severity_counts[severity] += 1
            
            stats = {
                'totalDetections': total_detections,
                'totalCavities': total_cavities,
                'averageCavitiesPerDetection': round(total_cavities / total_detections, 2) if total_detections > 0 else 0,
                'severityDistribution': severity_counts
            }
            
            logger.info(f"Generated statistics: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error generating statistics: {str(e)}")
            return {}

# Global instance
firebase_storage = FirebaseDetectionStorage()

def get_firebase_storage() -> FirebaseDetectionStorage:
    """Get the global Firebase storage instance"""
    return firebase_storage