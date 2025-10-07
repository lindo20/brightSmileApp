import { useNavigate } from "react-router-dom";
import {
  FaTooth,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserMd,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { db } from "../firebase/config"; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import happyToothImage from "../img/happy-dental-cartoon-tooth.avif";

const facts = [
  "Tooth enamel is the hardest substance in the human body.",
  "You should replace your toothbrush every three months.",
  "Dentists recommend brushing for two minutes twice daily.",
  "Flossing is just as important as brushing for gum health.",
  "The first toothbrush with bristles was invented in China in 1498.",
  "Your mouth produces over 25,000 quarts of saliva in a lifetime.",
  "50% of people say that a smile is the first feature they notice.",
  "Regular dental check-ups can detect early signs of oral cancer.",
  "Chewing sugar-free gum after meals can help prevent cavities.",
  "The average person spends 38.5 days brushing their teeth over a lifetime.",
];

function FactPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [randomFact, setRandomFact] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * facts.length);
    setRandomFact(facts[randomIndex]);
    setShowPopup(true);

    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setShowPopup(false);

  if (!showPopup) return null;

  return (
    <div
      className="fact-popup-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="fact-popup"
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <div
          className="fact-popup-header"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <h3 style={{ margin: 0, color: "#2c7da0", fontSize: "24px" }}>
            Did You Know?
          </h3>
          <button
            className="close-btn"
            onClick={handleClose}
            style={{
              position: "absolute",
              right: "0",
              top: "0",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
            }}
          >
            ×
          </button>
        </div>
        <div className="fact-popup-content">
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.5",
              color: "#333",
              marginBottom: "20px",
            }}
          >
            {randomFact}
          </p>
          <div
            style={{
              height: "4px",
              width: "100%",
              backgroundColor: "#f0f0f0",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "#2c7da0",
                animation: "shrink 2s linear forwards",
              }}
            ></div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const [showFact, setShowFact] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => setShowFact(true), []);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();

      const validAnnouncements = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((a) => {
          if (!a.createdAt || !a.duration) return true; // keep if no timestamp/duration
          const created = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const expiry = new Date(created.getTime() + a.duration * 24 * 60 * 60 * 1000);
          return now <= expiry;
        });

      setAnnouncements(validAnnouncements);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="welcome-page">
      {showFact && <FactPopup />}

      {/* Hero Section */}
      <div
        className="welcome-hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          textAlign: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="hero-content" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <FaTooth style={{ fontSize: "4rem", color: "#2c7da0" }} />
          </div>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "#2d3436" }}>
            Welcome to Bright Smile
          </h1>
          <p style={{ fontSize: "1.5rem", marginBottom: "2.5rem", color: "#636e72" }}>
            Your trusted partner for comprehensive dental care
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="cta-button"
              onClick={() => navigate("/select-role")}
              style={{
                padding: "1rem 2.5rem",
                fontSize: "1.2rem",
                backgroundColor: "#2c7da0",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(44, 125, 160, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#1d5d7e";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#2c7da0";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="announcements-section" style={{ padding: "5rem 2rem", backgroundColor: "#f8f9fa", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", color: "#2d3436" }}>
          Latest Announcements
        </h2>

        {announcements.length === 0 ? (
          <p style={{ color: "#636e72", fontSize: "1.2rem" }}>
            No announcements at the moment. Check back later!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {announcements.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: "2rem",
                  borderRadius: "12px",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                  backgroundColor: "white",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ color: "#2c7da0", marginBottom: "1rem" }}>{a.title}</h3>
                  {a.important && (
                    <span
                      style={{
                        backgroundColor: "#e74c3c",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        alignSelf: "center",
                      }}
                    >
                      Important
                    </span>
                  )}
                </div>
                <p style={{ color: "#636e72", marginBottom: "1rem" }}>{a.content}</p>
                <small style={{ color: "#999" }}>
                  Posted: {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : new Date(a.date).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights Section */}
      <div
        className="highlights-section"
        style={{
          padding: "5rem 2rem",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "2.5rem", marginBottom: "3rem", color: "#2d3436" }}
        >
          Why Choose Us?
        </h2>
        <div
          className="highlights-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            className="highlight-card"
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0, 0, 0, 0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div
              className="highlight-icon"
              style={{
                marginBottom: "1.5rem",
                color: "#2c7da0",
              }}
            >
              <FaClock size={32} />
            </div>
            <h3 style={{ marginBottom: "1rem", color: "#2d3436" }}>
              Flexible Hours
            </h3>
            <p style={{ color: "#636e72" }}>
              Open 6 days a week with emergency services available
            </p>
          </div>

          <div
            className="highlight-card"
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0, 0, 0, 0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div
              className="highlight-icon"
              style={{
                marginBottom: "1.5rem",
                color: "#2c7da0",
              }}
            >
              <FaTooth size={32} />
            </div>
            <h3 style={{ marginBottom: "1rem", color: "#2d3436" }}>
              Modern Technology
            </h3>
            <p style={{ color: "#636e72" }}>
              State-of-the-art equipment for pain-free treatments
            </p>
          </div>

          <div
            className="highlight-card"
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0, 0, 0, 0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div
              className="highlight-icon"
              style={{
                marginBottom: "1.5rem",
                color: "#2c7da0",
              }}
            >
              <FaUserMd size={32} />
            </div>
            <h3 style={{ marginBottom: "1rem", color: "#2d3436" }}>
              Expert Team
            </h3>
            <p style={{ color: "#636e72" }}>
              Board-certified dentists with years of experience
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div
        className="about-section"
        style={{
          padding: "5rem 2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          className="about-content"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            maxWidth: "1200px",
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div className="about-text">
            <h2
              style={{
                fontSize: "2.5rem",
                marginBottom: "1.5rem",
                color: "#2d3436",
              }}
            >
              About Our Clinic
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
                marginBottom: "2rem",
                color: "#636e72",
              }}
            >
              At Bright Smile, we combine cutting-edge technology with
              compassionate care to provide the best dental experience. Our
              clinic has been serving the community for over 15 years.
            </p>
            <button
              className="secondary-button"
              onClick={() => navigate("/about")}
              style={{
                padding: "0.8rem 2rem",
                fontSize: "1rem",
                backgroundColor: "transparent",
                color: "#2c7da0",
                border: "2px solid #2c7da0",
                borderRadius: "50px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#2c7da0";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#2c7da0";
              }}
            >
              Learn More
            </button>
          </div>
          <div className="about-image">
            <img
              src={happyToothImage}
              alt="Happy Dental Care"
              style={{
                width: "100%",
                height: "300px",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div
        className="pricing-section"
        style={{
          padding: "5rem 2rem",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "2.5rem", marginBottom: "3rem", color: "#2d3436" }}
        >
          Our Pricing
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            marginBottom: "3rem",
            color: "#636e72",
            maxWidth: "800px",
            margin: "0 auto 3rem",
          }}
        >
          We offer transparent pricing for all our dental services. All prices
          are in South African Rands (ZAR).
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Consultations */}
          <div
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#2c7da0", marginBottom: "1.5rem" }}>
              Consultations & Checkups
            </h3>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Consultation</span>
                <span style={{ fontWeight: "bold" }}>R1,100</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Regular Check Up</span>
                <span style={{ fontWeight: "bold" }}>R1,100 + R375</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Cosmetic Consultation</span>
                <span style={{ fontWeight: "bold" }}>R250 + R2,500</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Child Exam</span>
                <span style={{ fontWeight: "bold" }}>R250</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>X-rays with Check Up</span>
                <span style={{ fontWeight: "bold" }}>R3,750</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Scale and Polish</span>
                <span style={{ fontWeight: "bold" }}>R2,000</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Airflow</span>
                <span style={{ fontWeight: "bold" }}>R3,125</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Emergency Appointment</span>
                <span style={{ fontWeight: "bold" }}>R3,125+</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Periodontal Treatment</span>
                <span style={{ fontWeight: "bold" }}>Included</span>
              </div>
            </div>
          </div>

          {/* Restorative Treatments */}
          <div
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#2c7da0", marginBottom: "1.5rem" }}>
              Restorative Treatments
            </h3>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Veneers per tooth</span>
                <span style={{ fontWeight: "bold" }}>R9,375</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Composite</span>
                <span style={{ fontWeight: "bold" }}>R2,000</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Composite Repair</span>
                <span style={{ fontWeight: "bold" }}>R16,250</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Emax</span>
                <span style={{ fontWeight: "bold" }}>R15,000+</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Bridge (per unit)</span>
                <span style={{ fontWeight: "bold" }}>R3,125</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Temp Bridge (per unit)</span>
                <span style={{ fontWeight: "bold" }}>R3,125</span>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div
            style={{
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h3 style={{ color: "#2c7da0", marginBottom: "1.5rem" }}>
              Additional Services
            </h3>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Tooth Extraction</span>
                <span style={{ fontWeight: "bold" }}>R3,000+</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Root Canal (General)</span>
                <span style={{ fontWeight: "bold" }}>R12,500+</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Braces (Invisalign)</span>
                <span style={{ fontWeight: "bold" }}>From R100,000</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Dental Implants</span>
                <span style={{ fontWeight: "bold" }}>R62,500+</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <span>Teeth Whitening</span>
                <span style={{ fontWeight: "bold" }}>R15,000</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Dentures (Full)</span>
                <span style={{ fontWeight: "bold" }}>R18,750+</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "3rem",
            padding: "2rem",
            backgroundColor: "#e8f4fc",
            borderRadius: "12px",
            maxWidth: "800px",
            margin: "3rem auto 0",
          }}
        >
          <h4 style={{ color: "#2c7da0", marginBottom: "1rem" }}>
            Payment Plans Available
          </h4>
          <p style={{ color: "#636e72", marginBottom: "1.5rem" }}>
            We offer flexible payment plans to make dental care affordable. Ask
            about our Denplan options.
          </p>
          <button
            style={{
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              backgroundColor: "#2c7da0",
              color: "white",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#1d5d7e";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#2c7da0";
            }}
            onClick={() => navigate("/contact")}
          >
            Inquire About Payment Options
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div
        className="contact-section"
        style={{
          padding: "5rem 2rem",
          backgroundColor: "#f8f9fa",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "2.5rem", marginBottom: "3rem", color: "#2d3436" }}
        >
          Ready to Visit Us?
        </h2>
        <div
          className="contact-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "3rem",
            maxWidth: "1200px",
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div className="contact-info">
            <div
              className="contact-item"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <FaPhone
                className="contact-icon"
                style={{
                  fontSize: "1.5rem",
                  color: "#2c7da0",
                  marginRight: "1rem",
                }}
              />
              <div>
                <h4 style={{ margin: "0 0 0.3rem 0", color: "#2d3436" }}>
                  Phone
                </h4>
                <p style={{ margin: 0, color: "#636e72" }}>(555) 123-4567</p>
              </div>
            </div>
            <div
              className="contact-item"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <FaEnvelope
                className="contact-icon"
                style={{
                  fontSize: "1.5rem",
                  color: "#2c7da0",
                  marginRight: "1rem",
                }}
              />
              <div>
                <h4 style={{ margin: "0 0 0.3rem 0", color: "#2d3436" }}>
                  Email
                </h4>
                <p style={{ margin: 0, color: "#636e72" }}>
                  info@BrightSmile.com
                </p>
              </div>
            </div>
            <div
              className="contact-item"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <FaMapMarkerAlt
                className="contact-icon"
                style={{
                  fontSize: "1.5rem",
                  color: "##2c7da0",
                  marginRight: "1rem",
                }}
              />
              <div>
                <h4 style={{ margin: "0 0 0.3rem 0", color: "#2d3436" }}>
                  Address
                </h4>
                <p style={{ margin: 0, color: "#636e72" }}>
                  123 Dental Avenue, Smile City
                </p>
              </div>
            </div>
          </div>
          <div
            className="contact-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <button
              className="primary-button"
              onClick={() => navigate("/patient-signin")}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#2c7da0",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#1d5d7e";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#2c7da0";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <FaCalendarAlt /> Book Appointment
            </button>
            <button
              className="outline-button"
              onClick={() => navigate("/contact")}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "transparent",
                color: "#2c7da0",
                border: "2px solid #2c7da0",
                borderRadius: "50px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#2c7da0";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#2c7da0";
              }}
            >
              Contact Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
