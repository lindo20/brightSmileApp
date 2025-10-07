import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db 
} from '../../firebase/config';
import { 
  onAuthStateChanged, 
  reload,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  deleteUser  // ADD THIS IMPORT
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'; // ADD deleteDoc
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // SIGN IN FUNCTION - UPDATED WITH ROLE VALIDATION
  const signin = async (email, password, requiredRole = null) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data immediately after sign in
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('User signed in with role:', userData.role, 'Required role:', requiredRole);
        
        // VALIDATE ROLE - CRITICAL FIX
        if (requiredRole && userData.role !== requiredRole) {
          // Sign out immediately if wrong role
          await auth.signOut();
          throw new Error(`This account is registered as ${userData.role}. Please use the ${userData.role} sign-in page.`);
        }
        
        setUserData(userData);
        return { user, userData };
      } else {
        await auth.signOut(); // Sign out if no user data found
        throw new Error('User data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // SIGN UP FUNCTION
  const signup = async (email, password, role, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document with role
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
        ...additionalData
      });

      // Send email verification
      await sendEmailVerification(user);
      
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // SIGN OUT FUNCTION - FIXED VERSION
  const logout = async () => {
    try {
      // Store current path before signing out to determine where to redirect
      const currentPath = window.location.pathname;
      console.log('Logout - Current path:', currentPath);
      
      // ALWAYS redirect to role selection page after logout
      const redirectTo = '/select-role'; // Changed from sign-in pages
      
      console.log('Logout - Will redirect to:', redirectTo);
      
      // SIGN OUT FIRST
      await signOut(auth);
      
      // Then navigate to role selection after sign out is complete
      navigate(redirectTo, { replace: true });
      
      console.log('Logout - Completed');
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // DEACTIVATE ACCOUNT FUNCTION - ADD THIS
  const deactivateAccount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('Starting account deactivation for user:', user.uid);

      // Optional: Delete user data from Firestore first
      try {
        const userDocRef = doc(db, "users", user.uid);
        await deleteDoc(userDocRef);
        console.log('User document deleted from Firestore');
        
        // Add any additional data cleanup here
        // For example, if you have appointments or other collections:
        // await deleteUserAppointments(user.uid);
        // await deleteUserChats(user.uid);
        
      } catch (firestoreError) {
        console.warn('Firestore cleanup error (proceeding with account deletion):', firestoreError);
        // Continue with account deletion even if Firestore cleanup fails
      }

      // Delete the user account from Firebase Auth
      await deleteUser(user);
      console.log('User account deleted from Firebase Auth');
      
      // Clear local state
      setCurrentUser(null);
      setUserData(null);
      
      // Redirect to role selection page with success message
      navigate('/select-role', { 
        replace: true,
        state: { message: 'Your account has been successfully deactivated.' }
      });
      
    } catch (error) {
      console.error('Error deactivating account:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('For security, please sign out and sign in again before deactivating your account.');
      }
      
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      console.log('Current path:', window.location.pathname);
      
      if (user) {
        try {
          await reload(user);
          console.log('User email verified after reload:', user.emailVerified);
          
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('User data fetched:', userData);
            setUserData(userData);
          } else {
            console.log('No user document found');
            setUserData(null);
          }

          // Redirect unverified users to verify-email page
          const currentPath = window.location.pathname;
          const allowedPaths = ['/verify-email', '/signin', '/patient-signin', '/dentist-signin', '/admin-signin', '/select-role', '/', '/reset', '/welcome'];
          
          if (!user.emailVerified && !allowedPaths.includes(currentPath)) {
            console.log('Redirecting to verify-email page');
            navigate('/verify-email', { replace: true });
          }
          
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUserData(null);
        }
      } else {
        // USER SIGNED OUT - Clear data but don't auto-redirect
        setUserData(null);
        console.log('User signed out - data cleared, staying on current page');
        
        // Check if we're already on a sign-in or public page
        const currentPath = window.location.pathname;
        const publicPaths = ['/welcome', '/select-role', '/patient-signin', '/dentist-signin', '/admin-signin', '/', '/about', '/contact'];
        
        // Only redirect to welcome if we're on a private page and not already on a public page
        if (!publicPaths.includes(currentPath) && !currentPath.includes('-signin')) {
          console.log('Not on public page, but letting logout function handle redirect');
          // Don't redirect here - the logout function will handle it
        }
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const value = {
    currentUser,
    userData,
    isVerified: currentUser?.emailVerified || false,
    role: userData?.role || null,
    loading,
    signin,
    signup,    
    logout,     // Now includes smart redirect
    deactivateAccount  // ADD THIS TO THE CONTEXT VALUE
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}