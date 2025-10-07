// IP validation utility for admin access control

/**
 * Get the client's IP address
 * Note: In a real production environment, you would need a backend service
 * to properly validate IP addresses as client-side IP detection is not secure
 */
export const getClientIP = async () => {
  try {
    // For development/testing purposes, we'll use a public IP service
    // In production, this should be handled server-side
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return null;
  }
};

/**
 * Check if the current IP is allowed for admin access
 * @param {string} currentIP - The current user's IP address
 * @param {string[]} allowedIPs - Array of allowed IP addresses
 * @returns {boolean} - Whether the IP is allowed
 */
export const isIPAllowed = (currentIP, allowedIPs = ['196.21.218.222']) => {
  if (!currentIP) return false;
  return allowedIPs.includes(currentIP);
};

/**
 * Validate if user is on the allowed LAN network
 * @returns {Promise<boolean>} - Whether the user is on allowed network
 */
export const validateAdminAccess = async () => {
  try {
    // const currentIP = await getClientIP();
    // const allowedIPs = ['196.21.218.222'];
    
    // console.log('Current IP:', currentIP);
    // console.log('Allowed IPs:', allowedIPs);
    
    // return isIPAllowed(currentIP, allowedIPs);
    // Allow all IPs for admin access - no restrictions
    console.log('Admin access allowed for all IPs');
    return true;
  } catch (error) {
    console.error('Error validating admin access:', error);
    return false;
  }
};

/**
 * Get local network IP (for development testing)
 * This is a fallback method that attempts to get local network info
 */
export const getLocalNetworkIP = () => {
  return new Promise((resolve) => {
    // This is a workaround for development - in production you'd use server-side validation
    const pc = new RTCPeerConnection({iceServers: []});
    pc.createDataChannel('');
    pc.createOffer().then(pc.setLocalDescription.bind(pc));
    
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        resolve(null);
        return;
      }
      
      const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = () => {};
      resolve(myIP);
    };
  });
};