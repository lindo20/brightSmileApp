import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Firebase service for managing AI detection results
 */
export class DetectionService {
  
  /**
   * Save detection results to Firebase
   * @param {Object} detectionData - The detection results from AI model
   * @param {string} userId - The user ID who performed the detection
   * @param {string} userRole - The role of the user (patient/dentist/admin)
   * @returns {Promise<string>} - Document ID of saved detection
   */
  static async saveDetectionResults(detectionData, userId, userRole = 'patient') {
    try {
      const detectionRecord = {
        // User Information
        userId: userId,
        userRole: userRole,
        
        // Image Information
        imageMetadata: {
          fileName: detectionData.imageMetadata?.fileName || 'unknown',
          fileSize: detectionData.imageMetadata?.fileSize || 0,
          imageType: detectionData.imageMetadata?.imageType || 'unknown',
          uploadTimestamp: serverTimestamp()
        },
        
        // AI Model Results
        predictions: detectionData.predictions || [],
        totalDetections: detectionData.predictions?.length || 0,
        cavitiesFound: detectionData.predictions?.filter(p => p.class?.toLowerCase().includes('cavity')).length || 0,
        
        // Clinical Analysis
        clinicalAnalysis: {
          severityLevel: detectionData.severityAssessment?.overall_severity || 'unknown',
          cavityPercentage: detectionData.severityAssessment?.cavity_percentage || 0,
          confidenceScore: detectionData.severityAssessment?.confidence_score || 0,
          urgencyLevel: detectionData.severityAssessment?.urgency || 'routine',
          clinicalNotes: detectionData.treatmentRecommendations?.clinical_notes || [],
          recommendations: detectionData.treatmentRecommendations?.recommendations || []
        },
        
        // Processing Information
        processingTime: detectionData.processingTime || 0,
        modelInfo: detectionData.modelInfo || {},
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Status and Flags
        status: 'completed',
        reviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        
        // Additional metadata
        sessionId: detectionData.sessionId || null,
        deviceInfo: detectionData.deviceInfo || null
      };

      const docRef = await addDoc(collection(db, 'detectionResults'), detectionRecord);
      console.log('Detection results saved with ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('Error saving detection results:', error);
      throw new Error(`Failed to save detection results: ${error.message}`);
    }
  }

  /**
   * Get detection results for a specific user
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of results to fetch (default: 10)
   * @returns {Promise<Array>} - Array of detection results
   */
  static async getUserDetections(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, 'detectionResults'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const detections = [];
      
      querySnapshot.forEach((doc) => {
        detections.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return detections;
      
    } catch (error) {
      console.error('Error fetching user detections:', error);
      throw new Error(`Failed to fetch detections: ${error.message}`);
    }
  }

  /**
   * Get a specific detection result by ID
   * @param {string} detectionId - Detection document ID
   * @returns {Promise<Object>} - Detection result object
   */
  static async getDetectionById(detectionId) {
    try {
      const docRef = doc(db, 'detectionResults', detectionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Detection not found');
      }
      
    } catch (error) {
      console.error('Error fetching detection:', error);
      throw new Error(`Failed to fetch detection: ${error.message}`);
    }
  }

  /**
   * Update detection review status (for dentists/admins)
   * @param {string} detectionId - Detection document ID
   * @param {string} reviewerId - ID of the reviewer
   * @param {Object} reviewData - Review information
   * @returns {Promise<void>}
   */
  static async reviewDetection(detectionId, reviewerId, reviewData) {
    try {
      const docRef = doc(db, 'detectionResults', detectionId);
      
      await updateDoc(docRef, {
        reviewed: true,
        reviewedBy: reviewerId,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewData.notes || '',
        reviewerVerification: reviewData.verification || 'pending',
        updatedAt: serverTimestamp()
      });
      
      console.log('Detection review updated successfully');
      
    } catch (error) {
      console.error('Error updating detection review:', error);
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Get detection statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Statistics object
   */
  static async getUserDetectionStats(userId) {
    try {
      const q = query(
        collection(db, 'detectionResults'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      let totalDetections = 0;
      let totalCavities = 0;
      let severityCounts = { mild: 0, moderate: 0, severe: 0 };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalDetections++;
        totalCavities += data.cavitiesFound || 0;
        
        const severity = data.clinicalAnalysis?.severityLevel || 'mild';
        if (severityCounts.hasOwnProperty(severity)) {
          severityCounts[severity]++;
        }
      });
      
      return {
        totalDetections,
        totalCavities,
        averageCavitiesPerDetection: totalDetections > 0 ? (totalCavities / totalDetections).toFixed(2) : 0,
        severityDistribution: severityCounts,
        lastDetection: totalDetections > 0 ? querySnapshot.docs[0].data().createdAt : null
      };
      
    } catch (error) {
      console.error('Error fetching detection stats:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  /**
   * Delete a detection result
   * @param {string} detectionId - Detection document ID
   * @returns {Promise<void>}
   */
  static async deleteDetection(detectionId) {
    try {
      await deleteDoc(doc(db, 'detectionResults', detectionId));
      console.log('Detection deleted successfully');
      
    } catch (error) {
      console.error('Error deleting detection:', error);
      throw new Error(`Failed to delete detection: ${error.message}`);
    }
  }

  /**
   * Get all detections for dentist/admin review
   * @param {string} status - Filter by status (optional)
   * @param {number} limitCount - Number of results to fetch
   * @returns {Promise<Array>} - Array of detection results
   */
  static async getAllDetections(status = null, limitCount = 50) {
    try {
      let q;
      
      if (status) {
        q = query(
          collection(db, 'detectionResults'),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'detectionResults'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const detections = [];
      
      querySnapshot.forEach((doc) => {
        detections.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return detections;
      
    } catch (error) {
      console.error('Error fetching all detections:', error);
      throw new Error(`Failed to fetch detections: ${error.message}`);
    }
  }
}

export default DetectionService;