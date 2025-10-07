import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const PatientChat = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAAJG2mRNyXclv4t3Rn30TiaNTRCL1__rs",
    authDomain: "simleapp.firebaseapp.com",
    databaseURL: "https://simleapp-default-rtdb.firebaseio.com",
    projectId: "simleapp",
    storageBucket: "simleapp.firebasestorage.app",
    messagingSenderId: "1058525382298",
    appId: "1:1058525382298:web:a34f746d5f495968950123",
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadIndex, setLastReadIndex] = useState(-1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name =
          user.displayName ||
          (user.email ? user.email.split("@")[0] : "Patient");
        setPatientName(name);
        startChat(user.uid, name);
      } else {
        navigate("/patient-signin");
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, navigate]);

  const startChat = (uid, name) => {
    const patientId = "patient-" + uid;
    setCurrentPatientId(patientId);

    set(ref(database, `patients/${patientId}`), {
      name: name,
      lastActive: new Date().toISOString(),
    });

    const convoRef = ref(database, `conversations/${patientId}`);
    onValue(convoRef, (snapshot) => {
      if (!snapshot.exists()) {
        const welcomeMessage = {
          sender: "admin",
          text: `Hello ${name}! How can we help you today?`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
        };
        set(convoRef, [welcomeMessage]);
      }
    });
  };

  useEffect(() => {
    if (!currentPatientId) return;

    const messagesRef = ref(database, `conversations/${currentPatientId}`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val() || [];
      setMessages(messagesData);

      // Calculate unread messages (admin messages that are unread)
      const unreadMessages = messagesData.filter(
        (msg, index) =>
          msg.sender === "admin" && !msg.read && index > lastReadIndex
      );
      setUnreadCount(unreadMessages.length);
    });

    const typingRef = ref(database, `typing/${currentPatientId}`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      const typingData = snapshot.val();
      setTypingStatus(typingData ? `${typingData.name} is typing...` : "");
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentPatientId, database, lastReadIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Mark messages as read when they become visible
    if (messages.length > 0) {
      const lastAdminMessageIndex = messages
        .map((msg, index) => (msg.sender === "admin" ? index : -1))
        .filter((index) => index !== -1)
        .pop();

      if (
        lastAdminMessageIndex !== undefined &&
        lastAdminMessageIndex > lastReadIndex
      ) {
        setLastReadIndex(lastAdminMessageIndex);

        // Update read status in database for admin messages
        const updatedMessages = messages.map((msg, index) => {
          if (msg.sender === "admin" && index <= lastAdminMessageIndex) {
            return { ...msg, read: true };
          }
          return msg;
        });

        // Only update if there are changes
        if (
          updatedMessages.some(
            (msg, index) =>
              msg.sender === "admin" && msg.read !== messages[index]?.read
          )
        ) {
          set(
            ref(database, `conversations/${currentPatientId}`),
            updatedMessages
          );
        }
      }
    }
  }, [messages, currentPatientId, database, lastReadIndex]);

  const sendMessage = () => {
    if (!messageInput.trim() || !currentPatientId) return;

    const newMessage = {
      sender: "patient",
      text: messageInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true, // Patient messages are always read by the patient
    };

    updateTypingStatus(false);
    set(ref(database, `conversations/${currentPatientId}`), [
      ...messages,
      newMessage,
    ]);
    setMessageInput("");
  };

  const updateTypingStatus = (typing) => {
    if (!currentPatientId) return;

    if (typing) {
      if (!isTyping) {
        set(ref(database, `typing/${currentPatientId}`), {
          name: patientName,
          isTyping: true,
        });
        setIsTyping(true);
      }
      const timeout = setTimeout(() => updateTypingStatus(false), 1500);
      return () => clearTimeout(timeout);
    } else if (isTyping) {
      remove(ref(database, `typing/${currentPatientId}`));
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
        fontFamily: "'Inter', 'Segoe UI', Tahoma, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "80vh",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header with Unread Badge */}
        <div
          style={{
            padding: "15px",
            background: "linear-gradient(135deg, #4a90e2, #34c759)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ margin: 0 }}>🦷 BrightSmile Dental</h2>
            {unreadCount > 0 && (
              <div
                style={{
                  backgroundColor: "#ff4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  animation: "pulse 1.5s infinite",
                }}
              >
                {unreadCount}
              </div>
            )}
          </div>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onClick={() => navigate("/patient")}
          >
            ← Back
          </button>
        </div>

        {/* Loading state */}
        {!currentPatientId && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>Loading chat...</p>
          </div>
        )}

        {/* Chat Area */}
        {currentPatientId && (
          <>
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #eee",
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "#555",
              }}
            >
              {typingStatus}
              {unreadCount > 0 && (
                <span style={{ color: "#ff4444", marginLeft: "10px" }}>
                  {unreadCount} new message{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div
              style={{
                flex: 1,
                padding: "15px",
                overflowY: "auto",
                background: "#f9f9f9",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent:
                      msg.sender === "patient" ? "flex-end" : "flex-start",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      background:
                        msg.sender === "patient"
                          ? "linear-gradient(135deg, #4a90e2, #34c759)"
                          : "#e6e6e6",
                      color: msg.sender === "patient" ? "white" : "#333",
                      padding: "10px 15px",
                      borderRadius: "18px",
                      maxWidth: "70%",
                      fontSize: "0.95rem",
                      position: "relative",
                    }}
                  >
                    {msg.sender === "admin" && !msg.read && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          backgroundColor: "#ff4444",
                          borderRadius: "50%",
                          width: "12px",
                          height: "12px",
                        }}
                      />
                    )}
                    {msg.text}
                    <div
                      style={{
                        fontSize: "0.75rem",
                        marginTop: "4px",
                        opacity: 0.8,
                        textAlign: "right",
                      }}
                    >
                      {msg.time} •{" "}
                      {msg.sender === "patient" ? patientName : "Admin"}
                      {msg.sender === "admin" && !msg.read && (
                        <span style={{ color: "#ff4444", marginLeft: "5px" }}>
                          • New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #eee",
                display: "flex",
                gap: "10px",
                background: "white",
              }}
            >
              <input
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "24px",
                  fontSize: "1rem",
                }}
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  updateTypingStatus(true);
                }}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                style={{
                  background: "linear-gradient(135deg, #4a90e2, #34c759)",
                  color: "white",
                  border: "none",
                  borderRadius: "24px",
                  padding: "0 24px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default PatientChat;
