import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";  // npm i react-hot-toast
import LessonPractice from "./LessonPractice";

// ✅ Axios instance with retry + Render handling
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,  // 15s for cold starts
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
      toast.error("Backend waking up... retrying in 5s", { duration: 3000 });
      return new Promise((resolve) => {
        setTimeout(() => resolve(api(error.config)), 5000);  // Auto-retry
      });
    }
    return Promise.reject(error);
  }
);

export default function App() {
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/lessons");
      setLessons(data);
      toast.success("Lessons loaded!");
    } catch (err) {
      console.error(err);
      setError("Failed to load lessons. Backend may be sleeping—visit https://spoken-english-60qt.onrender.com/ to wake it.");
      toast.error("Load failed—check console");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <h1>Spoken English — Practice App</h1>
      <p>Select a lesson and start practicing.</p>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={fetchLessons} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="main-layout">
        <div className="sidebar">
          <h3>Lessons ({lessons.length})</h3>
          {loading ? (
            <div className="loading">Loading lessons...</div>
          ) : (
            <ul>
              {lessons.map((l) => (
                <li key={l._id}>
                  <button
                    className={selected?._id === l._id ? "active" : ""}
                    onClick={() => setSelected(l)}
                  >
                    {l.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lesson-content">
          {selected ? (
            <LessonPractice 
              lesson={selected} 
              onCompleted={() => toast.success("Lesson completed! 🎉")}
            />
          ) : !loading && lessons.length === 0 ? (
            <div>No lessons available.</div>
          ) : (
            <div>Select a lesson to start.</div>
          )}
        </div>
      </div>
    </div>
  );
}