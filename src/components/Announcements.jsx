import React, { useState, useEffect } from "react";
import { db } from "../firebase/config"; // adjust path if needed
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(data);
    });

    return () => unsubscribe();
  }, []);

  if (announcements.length === 0) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <i className="bi bi-megaphone fs-1 text-muted"></i>
          <h3 className="mt-3">No announcements yet</h3>
          <p className="text-muted">Check back later for updates from the clinic.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Announcements</h1>
      <div className="row">
        {announcements.map((a) => (
          <div key={a.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h3 className="h5 card-title text-primary">{a.title}</h3>
                  {a.important && (
                    <span className="badge bg-danger">Important</span>
                  )}
                </div>
                <p className="card-text">{a.content}</p>
              </div>
              <div className="card-footer bg-transparent">
                <small className="text-muted">
                  Posted: {a.createdAt?.toDate
                    ? a.createdAt.toDate().toLocaleDateString()
                    : new Date(a.date).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
