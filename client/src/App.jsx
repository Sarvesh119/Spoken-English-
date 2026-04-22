import React, { useEffect, useState } from "react";
import axios from "axios";
import LessonPractice from "./LessonPractice";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/lessons`)
      .then((r) => setLessons(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <h1>Spoken English — Practice App</h1>
      <p>Select a lesson and start practicing.</p>

      <div className="main-layout">
        <div className="sidebar">
          <h3>Lessons</h3>
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
        </div>

        <div className="lesson-content">
          {selected ? (
            <LessonPractice lesson={selected} />
          ) : (
            <div>Select a lesson to start.</div>
          )}
        </div>
      </div>
    </div>
  );
}
