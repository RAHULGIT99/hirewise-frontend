import React, { useState } from "react";
import styles from "./ResumeEvaluator.module.css";

export default function ResumeEvaluator() {
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!file) {
      setError("Please upload a resume file (PDF/DOCX/TXT).");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      if (role) fd.append("role", role);
      if (jobDesc) fd.append("job_description", jobDesc);

      const res = await fetch("https://hirewise-backend-e9l9.onrender.com/evaluate", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Server error");
      }
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.centered}>
        <div className={styles.card}>
          <h1 className={styles.heading}>ATS Resume Evaluator</h1>
          <p className={styles.subheading}>
            Upload a resume and (optionally) provide role & job description. Get an ATS score + tailored suggestions.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputRow}>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Candidate role (optional) e.g., Frontend Intern"
                className={styles.input}
              />
              <input
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Job description (optional) — paste full JD"
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Resume (PDF / DOCX / TXT) *</label>
              <div className={styles.fileUploadContainer}>
                <input
                  type="file"
                  id="resumeFile"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className={styles.fileInputHidden}
                />
                <label htmlFor="resumeFile" className={styles.fileUploadButton}>
                  Choose Resume File
                </label>
                {file && <span className={styles.fileName}>{file.name}</span>}
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? "Evaluating..." : "Evaluate Resume"}
              </button>
              <button
                type="button"
                onClick={() => { setRole(""); setJobDesc(""); setFile(null); setResult(null); setError(""); }}
                className={`${styles.button} ${styles.reset}`}
              >
                Reset
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </form>
        </div>

        {result && (
          <div className={styles.resultGrid}>
            <div className={styles.scoreCard}>
              <h2 className={styles.detailsTitle}>ATS Score</h2>
              <div className={styles.scoreContainer}>
                <div 
                  className={styles.scoreCircle} 
                  style={{ '--score': result.ats_score || 0 }}
                >
                  <div>
                    <div className={styles.score}>{result.ats_score ?? "N/A"}/100</div>
                    <div className={styles.scoreLabel}>Match level</div>
                  </div>
                </div>
              </div>
              <div className={styles.summary}>{result.summary ?? "No summary."}</div>
            </div>

            <div className={styles.detailsCard}>
              <div className={styles.detailsSection}>
                <h3 className={styles.detailsTitle}>Strengths</h3>
                <ul className={styles.detailsList}>
                  {(result.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsTitle}>Weaknesses</h3>
                <ul className={`${styles.detailsList} ${styles.weaknesses}`}>
                  {(result.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsTitle}>Top Suggestions</h3>
                <ol className={`${styles.detailsList} ${styles.suggestions}`}>
                  {(result.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>

              <div className={styles.detailsSection}>
                <h3 className={styles.detailsTitle}>Matching / Missing keywords</h3>
                <div className={styles.keywords}>
                  <strong>Matched:</strong> {(result.matching_keywords || []).slice(0,20).join(", ") || "—"}
                  <br />
                  <strong>Missing:</strong> {(result.missing_keywords || []).slice(0,20).join(", ") || "—"}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          Single-prompt Gemini 2.5 Flash-Lite evaluation • Use responsibly.
        </footer>
      </div>
    </div>
  );
}
