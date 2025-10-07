import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="container py-5 about-page">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="text-center mb-4">About SmileHigh Dental Clinic</h1>
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="about-section">
                <h2 className="mb-3">Our Mission</h2>
                <p className="lead">
                  To provide exceptional dental care with cutting-edge technology and compassionate service.
                </p>
              </div>
              
              <div className="about-section">
                <h2 className="mt-4 mb-3">Our Team</h2>
                <p>
                  Our team consists of board-certified dentists, hygienists, and support staff dedicated to your oral health.
                </p>
              </div>
              
              <div className="about-section">
                <h2 className="mt-4 mb-3">Our Technology</h2>
                <ul className="technology-list">
                  <li>Digital X-rays with 90% less radiation</li>
                  <li>Intraoral cameras for precise diagnosis</li>
                  <li>Laser dentistry for minimally invasive treatments</li>
                  <li>3D printing for same-day crowns</li>
                </ul>
              </div>
              
              <div className="about-section">
                <h2 className="mt-4 mb-3">Office Hours</h2>
                <div className="office-hours">
                  <p><strong>Monday-Friday:</strong> 8:00 AM - 6:00 PM</p>
                  <p><strong>Saturday:</strong> 9:00 AM - 3:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
              
              <div className="mt-4 d-flex gap-2 about-actions">
                <Link to="/welcome" className="btn btn-primary btn-with-icon">
                  <span className="btn-icon">←</span>
                  Back to welcome
                </Link>
              
                <Link to="/contact" className="btn btn-outline-primary">
                  <span className="btn-icon">←</span>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}