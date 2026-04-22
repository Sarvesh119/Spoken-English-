import React, { useEffect, useRef, useState } from "react";

// ✅ API from environment
const API = import.meta.env.VITE_API_URL;

function levenshtein(a = "", b = "") {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export default function LessonPractice({ lesson, markCompleted }) {
  const [transcript, setTranscript] = useState("");
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [similarity, setSimilarity] = useState(null);
  const [listening, setListening] = useState(false);
  const [words, setWords] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Reset on lesson change
  useEffect(() => {
    setTranscript("");
    setRecordingUrl(null);
    setSimilarity(null);
    setWords([]);
  }, [lesson]);

  // Speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recogn = new SpeechRecognition();
    recogn.continuous = true;
    recogn.interimResults = true;
    recogn.lang = "en-US";

    recogn.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }

      setTranscript(text);

      const arr = text.split(" ");
      setWords(arr.map((w, i) => ({
        word: w,
        active: i === arr.length - 1
      })));
    };

    recognitionRef.current = recogn;

    return () => {
      try {
        recogn.stop();
      } catch {}
    };
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // Recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];

    mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm"
      });
      setRecordingUrl(URL.createObjectURL(blob));
    };

    mr.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ✅ Upload using correct API
  const uploadRecording = async () => {
    if (!recordingUrl) return alert("No recording");

    const blob = await fetch(recordingUrl).then((r) => r.blob());

    const dist = levenshtein(transcript, lesson.text);
    const maxLen = Math.max(transcript.length, lesson.text.length, 1);
    const sim = Math.max(0, 1 - dist / maxLen);
    setSimilarity(sim);

    const form = new FormData();
    form.append("audio", blob, "speech.webm");
    form.append("userId", "anonymous");
    form.append("lessonId", lesson._id);
    form.append("transcript", transcript);
    form.append("similarity", sim);

    try {
      const res = await fetch(`${API}/recordings/upload`, {
        method: "POST",
        body: form
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Uploaded successfully");
      markCompleted?.(lesson._id);

    } catch (e) {
      alert("Upload error: " + e.message);
    }
  };

  return (
    <div className="lesson-content">
      <h2>{lesson.title}</h2>
      <p><strong>Target:</strong> {lesson.text}</p>

      {/* Transcript */}
      <div style={{ marginBottom: 20 }}>
        <h4>Live Transcript</h4>
        <div className="transcript-box">
          {words.length ? (
            words.map((w, i) => (
              <span key={i} className={`transcript-word ${w.active ? "active" : ""}`}>
                {w.word}{" "}
              </span>
            ))
          ) : (
            <em>Nothing yet</em>
          )}
        </div>

        <button onClick={!listening ? startListening : stopListening}>
          {!listening ? "Start Transcript" : "Stop Transcript"}
        </button>
      </div>

      {/* Recording */}
      <div>
        <h4>Record Audio</h4>

        <button onClick={!isRecording ? startRecording : stopRecording}>
          {!isRecording ? "Start Recording" : "Stop Recording"}
        </button>

        <button
          onClick={() => recordingUrl && new Audio(recordingUrl).play()}
        >
          Play
        </button>

        <button onClick={uploadRecording}>
          Upload
        </button>

        <div>
          Score: {similarity !== null
            ? `${Math.round(similarity * 100)}%`
            : "Not scored yet"}
        </div>
      </div>
    </div>
  );
}