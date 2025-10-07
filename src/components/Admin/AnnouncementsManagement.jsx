import React, { useState, useEffect } from "react"; 
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../auth/AuthProvider";

export default function AnnouncementsManagement() {
  const { currentUser, userData } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    important: false,
    expiryDate: "",
    expiryTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    visible: false,
    type: "",
    announcement: null,
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    important: false,
    expiryDate: "",
    expiryTime: "",
  });

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(data);
      },
      (err) => console.error("Error fetching announcements:", err)
    );
    return () => unsubscribe();
  }, []);

  const isExpired = (announcement) => {
    if (!announcement.expiryTimestamp) return false;
    return new Date(announcement.expiryTimestamp).getTime() <= Date.now();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (error) setError("");
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({ ...editFormData, [name]: type === "checkbox" ? checked : value });
  };

  const validateForm = () => {
    if (!formData.title.trim()) return setError("Title is required") && false;
    if (!formData.content.trim()) return setError("Content is required") && false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (!currentUser || userData?.role !== "admin") {
      setError("You must be an admin to add announcements");
      setLoading(false);
      return;
    }

    try {
      let expiryTimestamp = null;
      if (formData.expiryDate && formData.expiryTime) {
        expiryTimestamp = new Date(`${formData.expiryDate}T${formData.expiryTime}`).toISOString();
      } else if (formData.expiryDate) {
        expiryTimestamp = new Date(`${formData.expiryDate}T23:59:59`).toISOString();
      }

      await addDoc(collection(db, "announcements"), {
        title: formData.title.trim(),
        content: formData.content.trim(),
        important: formData.important,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        expiryDate: formData.expiryDate || null,
        expiryTime: formData.expiryTime || null,
        expiryTimestamp,
      });

      setFormData({ title: "", content: "", important: false, expiryDate: "", expiryTime: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error saving announcement:", err);
      setError("Error saving announcement: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, announcement) => {
    setModal({ visible: true, type, announcement });
    if (type === "edit") {
      setEditFormData({
        title: announcement.title,
        content: announcement.content,
        important: announcement.important,
        expiryDate: announcement.expiryDate || "",
        expiryTime: announcement.expiryTime || "",
      });
    }
  };
  const closeModal = () => setModal({ visible: false, type: "", announcement: null });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!modal.announcement) return;

    try {
      let expiryTimestamp = null;
      if (editFormData.expiryDate && editFormData.expiryTime) {
        expiryTimestamp = new Date(`${editFormData.expiryDate}T${editFormData.expiryTime}`).toISOString();
      } else if (editFormData.expiryDate) {
        expiryTimestamp = new Date(`${editFormData.expiryDate}T23:59:59`).toISOString();
      }

      await updateDoc(doc(db, "announcements", modal.announcement.id), {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        important: editFormData.important,
        expiryDate: editFormData.expiryDate || null,
        expiryTime: editFormData.expiryTime || null,
        expiryTimestamp,
      });

      closeModal();
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError("Error updating announcement: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!modal.announcement) return;
    try {
      await deleteDoc(doc(db, "announcements", modal.announcement.id));
      closeModal();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("Error deleting announcement: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem", background: "#f8f9fa", minHeight: "100vh" }}>
      
      
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <h1 className="text-center mb-4">Announcements Management</h1>
        {error && <div className="alert alert-danger">{error}</div>}

        {showForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="h5 mb-3 text-center">New Announcement</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows="4" name="content" value={formData.content} onChange={handleInputChange} required />
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" name="important" checked={formData.important} onChange={handleInputChange} />
                  <label className="form-check-label">Mark as important</label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-control" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiry Time</label>
                  <input type="time" className="form-control" name="expiryTime" value={formData.expiryTime} onChange={handleInputChange} />
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Announcement"}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h3 className="h5 mb-3 text-center">Current Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-center py-4">No announcements yet.</p>
            ) : (
              <div className="row justify-content-center">
                {announcements.map((a) => {
                  const expired = isExpired(a);
                  return (
                    <div key={a.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">
                                {a.title}
                                {a.important && <span className="badge bg-danger ms-2">Important</span>}
                                {expired && <span className="badge bg-secondary ms-2">Expired</span>}
                              </h5>
                            </div>
                            <p className="card-text">{a.content}</p>
                            <small className="text-muted d-block mb-1">
                              Created: {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : new Date(a.date).toLocaleDateString()}
                            </small>
                            {a.expiryDate && (
                              <small className={`d-block ${expired ? "text-secondary" : "text-danger"}`}>
                                Expires on: {a.expiryDate}{a.expiryTime && ` at ${a.expiryTime}`}
                              </small>
                            )}
                          </div>

                          <div className="d-grid gap-2 mt-3">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => openModal("edit", a)} disabled={expired}>Edit</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => openModal("delete", a)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="d-grid gap-2 mt-4">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add New Announcement</button>
        </div>




        {modal.visible && (
          <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1050}}>
            <div style={{background:'#fff',borderRadius:'8px',maxWidth:'500px',width:'100%',boxShadow:'0 5px 15px rgba(0,0,0,0.3)',padding:'20px'}}>
              {modal.type === "edit" && (
                <>
                  <h5 className="mb-3">Edit Announcement</h5>
                  <form onSubmit={handleEditSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" name="title" value={editFormData.title} onChange={handleEditInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Content</label>
                      <textarea className="form-control" rows="4" name="content" value={editFormData.content} onChange={handleEditInputChange} required />
                    </div>
                    <div className="form-check mb-3">
                      <input type="checkbox" className="form-check-input" name="important" checked={editFormData.important} onChange={handleEditInputChange} />
                      <label className="form-check-label">Mark as important</label>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input type="date" className="form-control" name="expiryDate" value={editFormData.expiryDate} onChange={handleEditInputChange} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Expiry Time</label>
                      <input type="time" className="form-control" name="expiryTime" value={editFormData.expiryTime} onChange={handleEditInputChange} />
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                  </form>
                </>
              )}
              {modal.type === "delete" && (
                <>
                  <h5>Confirm Delete</h5>
                  <p>Are you sure you want to delete <strong>{modal.announcement?.title}</strong>?</p>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
