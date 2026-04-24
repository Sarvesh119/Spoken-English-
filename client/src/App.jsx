import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";  // npm i react-hot-toast
import LessonPractice from "./LessonPractice";

// ✅ Axios instance with retry + Render handling
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// ✅ Retry limit
const MAX_RETRIES = 3;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;

    // initialize retry count
    config.__retryCount = config.__retryCount || 0;

    if (
      (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) &&
      config.__retryCount < MAX_RETRIES
    ) {
      config.__retryCount += 1;

      toast.loading(
        `Backend waking up... retry ${config.__retryCount}/${MAX_RETRIES}`,
        { duration: 2000 }
      );

      await new Promise((res) => setTimeout(res, 5000));

      return api(config);
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
      toast.dismiss();
      toast.success("Lessons loaded!");
    } catch (err) {
      console.error(err);
      setError("⏳ Server is starting... please wait 10–20 seconds and retry.");
      toast.error("Server waking up, please wait...");
    } finally {
      setLoading(false);
    }
  }, [api]);

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