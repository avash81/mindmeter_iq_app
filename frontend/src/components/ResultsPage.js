import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  Download,
  X,
  TrendingUp,
  Clock,
  Target,
  Brain,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const config = location.state?.config;

  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!result) {
    navigate("/");
    return null;
  }

  const percentage = (
    (result.correct_answers / result.total_questions) *
    100
  ).toFixed(1);
  const avgTimePerQuestion = Math.floor(
    result.time_taken / result.total_questions
  );

  const getIQCategory = (iq) => {
    if (iq >= 145) return { label: "Genius", color: "#9333ea" };
    if (iq >= 130) return { label: "Very Superior", color: "#7c3aed" };
    if (iq >= 120) return { label: "Superior", color: "#8b5cf6" };
    if (iq >= 110) return { label: "High Average", color: "#a78bfa" };
    if (iq >= 90) return { label: "Average", color: "#60a5fa" };
    if (iq >= 80) return { label: "Low Average", color: "#93c5fd" };
    return { label: "Below Average", color: "#bfdbfe" };
  };

  const getPerformanceMessage = (iq) => {
    if (iq >= 145)
      return "Exceptional cognitive abilities! You're in the top 0.1% of the population.";
    if (iq >= 130)
      return "Outstanding performance! You qualify for high-IQ societies like Mensa.";
    if (iq >= 120)
      return "Excellent cognitive abilities! You're in the top 10%.";
    if (iq >= 110)
      return "Above average intelligence. Strong problem-solving capabilities.";
    if (iq >= 90)
      return "Average cognitive performance. Good baseline abilities.";
    if (iq >= 80)
      return "Below average but within normal range. Room for improvement.";
    return "Consider retaking the test in a focused environment.";
  };

  const iqCategory = getIQCategory(result.iq_score);

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
          email: email.trim() || null,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `IQ_Certificate_${name.replace(/\s+/g, "_")}.pdf`
      );
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="results-container-advanced">
      <div className="results-main-card">
        <div className="results-trophy-icon">
          <Trophy size={56} color="#7c3aed" />
        </div>

        <h1 className="results-title-advanced" data-testid="results-title">
          Assessment Complete!
        </h1>

        <div className="iq-score-section">
          <div className="iq-label-advanced">Your IQ Score</div>
          <div
            className="iq-score-large"
            data-testid="iq-score"
            style={{ color: iqCategory.color }}
          >
            {result.iq_score}
          </div>
          <div
            className="iq-category"
            style={{
              backgroundColor: iqCategory.color + "20",
              color: iqCategory.color,
            }}
          >
            {iqCategory.label}
          </div>
          <div className="iq-percentile">
            Top {(100 - result.percentile).toFixed(1)}% · {result.percentile}th
            Percentile
          </div>
        </div>

        <div className="performance-message">
          {getPerformanceMessage(result.iq_score)}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} color="#7c3aed" />
            </div>
            <div className="stat-content">
              <div className="stat-value-large" data-testid="correct-answers">
                {result.correct_answers}/{result.total_questions}
              </div>
              <div className="stat-label-small">Correct Answers</div>
              <div className="stat-subtext">{percentage}% accuracy</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} color="#7c3aed" />
            </div>
            <div className="stat-content">
              <div className="stat-value-large">
                {formatTime(result.time_taken)}
              </div>
              <div className="stat-label-small">Total Time</div>
              <div className="stat-subtext">
                {avgTimePerQuestion}s per question
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} color="#7c3aed" />
            </div>
            <div className="stat-content">
              <div className="stat-value-large">{result.age}</div>
              <div className="stat-label-small">Age Group</div>
              <div className="stat-subtext">Age-normalized score</div>
            </div>
          </div>
        </div>

        {result.category_scores &&
          Object.keys(result.category_scores).length > 0 && (
            <div className="category-analysis">
              <h3 className="section-title">
                <Brain size={20} />
                Performance by Category
              </h3>
              <div className="category-bars">
                {Object.entries(result.category_scores).map(
                  ([category, score]) => (
                    <div key={category} className="category-bar-item">
                      <div className="category-bar-header">
                        <span className="category-name">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className="category-score">{score}%</span>
                      </div>
                      <div className="category-bar-container">
                        <div
                          className="category-bar-fill"
                          style={{
                            width: `${score}%`,
                            backgroundColor:
                              score >= 70
                                ? "#10b981"
                                : score >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        <div className="results-actions-advanced">
          <button
            className="action-btn-advanced primary"
            onClick={() => setShowCertificateForm(true)}
            data-testid="download-certificate-btn"
          >
            <Download size={20} />
            Download Certificate
          </button>
          <button
            className="action-btn-advanced secondary"
            onClick={() => navigate("/")}
            data-testid="retake-test-btn"
          >
            <RotateCcw size={20} />
            Take Another Test
          </button>
        </div>

        <div
          className="results-disclaimer-advanced"
          data-testid="results-disclaimer"
        >
          <strong>Disclaimer:</strong> This assessment provides an estimated IQ
          score for educational and entertainment purposes. For clinical or
          professional evaluation, consult a licensed psychologist.
        </div>
      </div>

      {/* Certificate Form Modal */}
      {showCertificateForm && (
        <div className="modal-overlay-advanced" data-testid="certificate-modal">
          <div className="modal-content-advanced">
            <div className="modal-header-advanced">
              <h2 className="modal-title-advanced">
                Download Your Certificate
              </h2>
              <button
                className="modal-close-advanced"
                onClick={() => setShowCertificateForm(false)}
                data-testid="close-modal-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleDownloadCertificate}
              className="certificate-form-advanced"
            >
              <div className="form-group-advanced">
                <label htmlFor="name" className="form-label-advanced">
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input-advanced"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="name-input"
                />
              </div>

              <div className="form-group-advanced">
                <label htmlFor="email" className="form-label-advanced">
                  Email (Optional)
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input-advanced"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                />
              </div>

              <button
                type="submit"
                className="form-submit-btn-advanced"
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
        <img
          src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
          alt="Emergent"
        />
        <span>Made with Emergent</span>
      </a>
    </div>
  );
};

export default ResultsPage;
