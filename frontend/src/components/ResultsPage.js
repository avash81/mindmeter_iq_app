import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Download, X } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!result) {
    navigate("/");
    return null;
  }

  const percentage = ((result.correct_answers / result.total_questions) * 100).toFixed(1);

  const getPerformanceMessage = (iq) => {
    if (iq >= 130) return "Outstanding performance! 🎉";
    if (iq >= 115) return "Excellent work! 🌟";
    if (iq >= 100) return "Good job! 👍";
    if (iq >= 85) return "Nice effort! 💪";
    return "Keep practicing! 📚";
  };

  const handleDownloadCertificate = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    setDownloading(true);
    try {
      const response = await axios.post(
        `${API}/certificate/download`,
        {
          test_id: result.test_id,
          name: name.trim(),
          email: email.trim() || null
        },
        {
          responseType: "blob"
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IQ_Certificate_${name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowCertificateForm(false);
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="results-container">
      <div className="results-card">
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          <Trophy size={48} color="#7c3aed" style={{ display: "inline-block" }} />
        </div>
        
        <h1 className="results-title" data-testid="results-title">Test Complete!</h1>
        
        <p style={{ fontSize: "1.1rem", color: "#6b7280", marginBottom: "1rem" }}>
          {getPerformanceMessage(result.iq_score)}
        </p>

        <div className="iq-score-display">
          <div className="iq-label">Your Mock IQ Score</div>
          <div className="iq-score" data-testid="iq-score">{result.iq_score}</div>
        </div>

        <div className="score-details">
          <div className="score-row">
            <span className="score-label">Correct Answers</span>
            <span className="score-value" data-testid="correct-answers">
              {result.correct_answers} / {result.total_questions}
            </span>
          </div>
          <div className="score-row">
            <span className="score-label">Accuracy</span>
            <span className="score-value" data-testid="accuracy">{percentage}%</span>
          </div>
        </div>

        <div className="results-disclaimer" data-testid="results-disclaimer">
          This is a mock IQ estimate for demonstration purposes only. It does not represent a professional psychological assessment.
        </div>

        <div className="results-actions">
          <button
            className="action-btn primary"
            onClick={() => setShowCertificateForm(true)}
            data-testid="download-certificate-btn"
          >
            <Download size={18} style={{ display: "inline-block", marginRight: "0.5rem" }} />
            Download Certificate
          </button>
          <button
            className="action-btn secondary"
            onClick={() => navigate("/")}
            data-testid="retake-test-btn"
          >
            <RotateCcw size={18} style={{ display: "inline-block", marginRight: "0.5rem" }} />
            Take Another Test
          </button>
        </div>
      </div>

      {/* Certificate Form Modal */}
      {showCertificateForm && (
        <div className="modal-overlay" data-testid="certificate-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Download Your Certificate</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCertificateForm(false)}
                data-testid="close-modal-btn"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleDownloadCertificate} className="certificate-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="name-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email (Optional)
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                />
              </div>

              <button
                type="submit"
                className="form-submit-btn"
                disabled={downloading}
                data-testid="submit-certificate-btn"
              >
                {downloading ? "Generating..." : "Download Certificate"}
              </button>
            </form>
          </div>
        </div>
      )}

      <a
        href="https://app.emergent.sh/?utm_source=emergent-badge"
        target="_blank"
        rel="noopener noreferrer"
        className="emergent-badge"
        data-testid="emergent-badge-results"
      >
        <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Emergent" />
        <span>Made with Emergent</span>
      </a>
    </div>
  );
};

export default ResultsPage;
