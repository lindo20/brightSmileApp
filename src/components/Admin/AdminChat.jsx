import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";

const AdminChat = () => {
  const firebaseConfig = {
  apiKey: "AIzaSyAAJG2mRNyXclv4t3Rn30TiaNTRCL1__rs",
  authDomain: "simleapp.firebaseapp.com",
  databaseURL: "https://simleapp-default-rtdb.firebaseio.com",
  projectId: "simleapp",
  storageBucket: "simleapp.firebasestorage.app",
  messagingSenderId: "1058525382298",
  appId: "1:1058525382298:web:a34f746d5f495968950123"

};

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(window.innerWidth <= 576);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 576;
      setIsMobile(mobile);
      if (mobile && !currentPatient) {
        setMobileSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentPatient]);

  // Fetch patients
  useEffect(() => {
    const patientsRef = ref(database, "patients");
    const unsubscribe = onValue(
      patientsRef,
      (snapshot) => {
        setLoading(true);
        try {
          const data = snapshot.val();
          console.log("Firebase patients data:", data);
          if (data) {
            const patientList = Object.entries(data).map(([id, patient]) => ({
              id,
              name: patient.name || `Patient ${id}`,
              ...patient,
            }));
            setPatients(patientList);
            console.log("Processed patients:", patientList);
          } else {
            setPatients([]);
            console.log("No patients found in Firebase");
          }
          setError(null);
        } catch (err) {
          console.error("Error fetching patients:", err);
          setError("Failed to load patients. Please check Firebase configuration or permissions.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
        setError("Failed to connect to Firebase. Check your configuration or permissions.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [database]);

  // Fetch messages and typing status
  useEffect(() => {
    if (!currentPatient) return;

    const messagesRef = ref(database, `conversations/${currentPatient.id}`);
    const messagesUnsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val() || [];
        setMessages(data);
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages.");
      }
    );

    const typingRef = ref(database, `typing/${currentPatient.id}`);
    const typingUnsubscribe = onValue(
      typingRef,
      (snapshot) => {
        const data = snapshot.val();
        setTypingStatus(data ? `${data.name} is typing...` : "");
      },
      (err) => {
        console.error("Error fetching typing status:", err);
        setError("Failed to load typing status.");
      }
    );

    return () => {
      messagesUnsubscribe();
      typingUnsubscribe();
    };
  }, [currentPatient, database]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !currentPatient) return;

    const newMessage = {
      sender: "admin",
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    updateTypingStatus(false);

    set(ref(database, `conversations/${currentPatient.id}`), [...messages, newMessage]).catch((err) => {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    });
    setMessageInput("");
  };

  const updateTypingStatus = (typing) => {
    if (!currentPatient) return;

    if (typing) {
      if (!isTyping) {
        set(ref(database, `typing/${currentPatient.id}`), { name: "Admin", isTyping: true }).catch((err) =>
          console.error("Error updating typing status:", err)
        );
        setIsTyping(true);
      }
      const timeout = setTimeout(() => updateTypingStatus(false), 1500);
      return () => clearTimeout(timeout);
    } else if (isTyping) {
      remove(ref(database, `typing/${currentPatient.id}`)).catch((err) =>
        console.error("Error removing typing status:", err)
      );
      setIsTyping(false);
    }
  };

  // ---------- Inline styles ----------
  const sidebarStyle = {
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    padding: isMobile ? "15px" : "20px",
    display: isMobile ? (mobileSidebarOpen ? "flex" : "none") : "flex",
    flexDirection: "column",
    width: isMobile ? "100%" : "200px",
    position: isMobile ? "fixed" : "relative",
    top: 0,
    left: 0,
    height: isMobile ? "100vh" : "auto",
    zIndex: 1000,
    boxShadow: isMobile ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
    overflowY: "auto",
  };

  const sidebarToggleStyle = {
    display: isMobile ? "block" : "none",
    cursor: "pointer",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: isMobile ? "0.9rem" : "1rem",
    padding: "8px 12px",
    background: "#ffffff",
    color: "#1a3c34",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "auto",
    minWidth: "120px",
  };

  const patientItemStyle = (patient) => ({
    padding: isMobile ? "10px" : "12px",
    margin: isMobile ? "8px 10px" : "8px 0",
    borderRadius: "12px",
    cursor: "pointer",
    backgroundColor: currentPatient?.id === patient.id ? "#357abd" : "rgba(255,255,255,0.15)",
    textAlign: "center",
    transition: "background-color 0.3s ease",
    fontSize: isMobile ? "0.85rem" : "1rem",
    border: "1px solid rgba(255,255,255,0.2)",
  });

  const containerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    maxWidth: isMobile ? "100%" : "900px",
    margin: isMobile ? "0" : "0 auto",
    height: isMobile ? "100vh" : "100vh",
    borderRadius: isMobile ? "0" : "12px",
    overflow: "hidden",
    boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "white",
    flex: 1,
    position: "relative",
  };

  const chatAreaStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    padding: isMobile ? "10px" : "0",
    marginTop: isMobile ? "50px" : "0", // Add margin to avoid overlap with toggle button
  };

  const chatHeaderStyle = {
    padding: isMobile ? "10px" : "15px",
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: isMobile ? "1rem" : "1.2rem",
  };

  const messagesStyle = {
    flex: 1,
    padding: isMobile ? "10px" : "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "#f0f4f8",
  };

  const messageStyle = (msg) => ({
    maxWidth: isMobile ? "85%" : "80%",
    padding: isMobile ? "8px 12px" : "10px 14px",
    marginBottom: "8px",
    borderRadius: "18px",
    background: msg.sender === "admin" ? "linear-gradient(135deg, #4a90e2, #34c759)" : "#e6f0fa",
    color: msg.sender === "admin" ? "white" : "#1a3c34",
    alignSelf: msg.sender === "admin" ? "flex-end" : "flex-start",
    wordBreak: "break-word",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
  });

  const chatInputStyle = {
    padding: isMobile ? "8px" : "10px",
    borderTop: "1px solid #dee2e6",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  const inputStyle = {
    flex: 1,
    padding: isMobile ? "8px 12px" : "10px 16px",
    borderRadius: "50px",
    border: "1px solid #ced4da",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    outline: "none",
    margin: isMobile ? "0 0 8px 0" : "0 10px 0 0",
    minWidth: "0",
  };

  const buttonStyle = {
    padding: isMobile ? "8px 16px" : "10px 20px",
    borderRadius: "50px",
    border: "none",
    background: "linear-gradient(135deg, #4a90e2, #34c759)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    width: isMobile ? "100%" : "auto",
  };

  const loadingStyle = {
    padding: isMobile ? "10px" : "15px",
    textAlign: "center",
    color: "#666",
    fontSize: isMobile ? "0.85rem" : "1rem",
  };

  const errorStyle = {
    padding: isMobile ? "10px" : "15px",
    textAlign: "center",
    color: "#dc3545",
    fontSize: isMobile ? "0.85rem" : "1rem",
  };

  // ---------- JSX ----------
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 1001,
            ...sidebarToggleStyle,
          }}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          🦷 {mobileSidebarOpen ? "Close Patients" : "Select Patient"}
        </div>
      )}
      <div style={containerStyle}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <h2 style={{ marginBottom: "15px", textAlign: "center", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            BrightSmile Admin
          </h2>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && <div style={loadingStyle}>Loading patients...</div>}
            {error && <div style={errorStyle}>{error}</div>}
            {!loading && !error && patients.length === 0 && (
              <div style={loadingStyle}>No patients found.</div>
            )}
            {!loading &&
              !error &&
              patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    setCurrentPatient(patient);
                    setMobileSidebarOpen(false);
                  }}
                  style={patientItemStyle(patient)}
                >
                  {patient.name}
                </div>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={chatAreaStyle}>
          <div style={chatHeaderStyle}>
            {currentPatient ? currentPatient.name : "Select a patient"}
            <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", fontWeight: "normal", opacity: 0.8 }}>
              {typingStatus}
            </div>
          </div>

          <div style={messagesStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={messageStyle(msg)}>
                <div>{msg.text}</div>
                <div style={{ fontSize: isMobile ? "0.65rem" : "0.7rem", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                  {msg.time} • {msg.sender === "admin" ? "You" : "Patient"}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          <div style={chatInputStyle}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                updateTypingStatus(true);
              }}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              disabled={!currentPatient}
              style={inputStyle}
            />
            <button onClick={sendMessage} disabled={!currentPatient} style={buttonStyle}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;