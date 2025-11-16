import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Brain, Target, TrendingUp, Award, Users } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [testType, setTestType] = useState("standard");
  const [stats, setStats] = useState({ total_tests_taken: 0, average_iq: 100 });
  const [showAgeError, setShowAgeError] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleStartTest = () => {
    const ageNum = parseInt(age);
    if (!age || ageNum < 10 || ageNum > 100) {
      setShowAgeError(true);
      return;
    }
    setShowAgeError(false);
    const config = { age: ageNum, test_type: testType };
    navigate("/test", { state: { config } });
  };

  return (
    <div className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title" data-testid="hero-title">
          MindMeter IQ
        </h1>
        <h2 className="hero-subtitle" data-testid="hero-subtitle">
          Professional Cognitive Assessment
        </h2>
        <p className="hero-description" data-testid="hero-description">
          Take our scientifically-designed IQ test with age-normalized scoring.
          Join over {stats.total_tests_taken.toLocaleString()}+ people who have
          discovered their cognitive potential.
        </p>
      </div>

      <div className="stats-banner">
        <div className="stat-item">
          <Users size={24} color="#7c3aed" />
          <div>
            <div className="stat-value">
              {stats.total_tests_taken.toLocaleString()}+
            </div>
            <div className="stat-label">Tests Taken</div>
          </div>
        </div>
        <div className="stat-item">
          <TrendingUp size={24} color="#7c3aed" />
          <div>
            <div className="stat-value">{stats.average_iq}</div>
            <div className="stat-label">Average IQ</div>
          </div>
        </div>
        <div className="stat-item">
          <Award size={24} color="#7c3aed" />
          <div>
            <div className="stat-value">98th</div>
            <div className="stat-label">Top Percentile</div>
          </div>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card" data-testid="feature-duration">
          <div className="feature-icon">
            <Clock size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Flexible Testing</h3>
          <p className="feature-text">
            Choose from quick, standard, or comprehensive test formats.
          </p>
        </div>
        <div className="feature-card" data-testid="feature-categories">
          <div className="feature-icon">
            <Brain size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Multi-Domain Assessment</h3>
          <p className="feature-text">
            Pattern recognition, logical reasoning, mathematics & verbal skills.
          </p>
        </div>
        <div className="feature-card" data-testid="feature-results">
          <div className="feature-icon">
            <Target size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Age-Normalized Scoring</h3>
          <p className="feature-text">
            Get accurate IQ scores adjusted for your age group.
          </p>
        </div>
      </div>

      <div className="config-section">
        <h2 className="config-title" data-testid="config-title">
          Begin Your Assessment
        </h2>

        <div className="config-group">
          <label className="config-label" data-testid="age-label">
            Enter Your Age
          </label>
          <input
            type="number"
            className={`age-input ${showAgeError ? "error" : ""}`}
            placeholder="Enter your age (10-100)"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setShowAgeError(false);
            }}
            min="10"
            max="100"
            data-testid="age-input"
          />
          {showAgeError && (
            <div className="error-message">
              Please enter a valid age between 10 and 100
            </div>
          )}
          <p className="input-hint">
            Age is required for accurate IQ score normalization
          </p>
        </div>

        <div className="config-group">
          <label className="config-label" data-testid="test-type-label">
            Test Type
          </label>
          <div className="test-type-options">
            <div
              className={`test-type-card ${
                testType === "quick" ? "selected" : ""
              }`}
              onClick={() => setTestType("quick")}
              data-testid="test-type-quick"
            >
              <div className="test-type-name">Quick</div>
              <div className="test-type-details">20 questions · ~20 min</div>
              <div className="test-type-desc">Fast assessment</div>
            </div>
            <div
              className={`test-type-card ${
                testType === "standard" ? "selected" : ""
              }`}
              onClick={() => setTestType("standard")}
              data-testid="test-type-standard"
            >
              <div className="test-type-name">Standard</div>
              <div className="test-type-details">30 questions · ~30 min</div>
              <div className="test-type-desc">Recommended</div>
            </div>
            <div
              className={`test-type-card ${
                testType === "comprehensive" ? "selected" : ""
              }`}
              onClick={() => setTestType("comprehensive")}
              data-testid="test-type-comprehensive"
            >
              <div className="test-type-name">Comprehensive</div>
              <div className="test-type-details">50 questions · ~50 min</div>
              <div className="test-type-desc">Most accurate</div>
            </div>
          </div>
        </div>

        <button
          className="start-btn"
          onClick={handleStartTest}
          data-testid="start-test-btn"
        >
          Start IQ Assessment
        </button>

        <div className="test-info">
          <h4>What You'll Get:</h4>
          <ul>
            <li>✓ Age-normalized IQ score</li>
            <li>✓ Percentile ranking</li>
            <li>✓ Detailed performance analysis</li>
            <li>✓ Category-wise breakdown</li>
            <li>✓ Downloadable certificate</li>
          </ul>
        </div>

        <p className="disclaimer">
          Professional-grade assessment · Free results · Certificate included
        </p>
      </div>

      <a
        href="https://app.emergent.sh/?utm_source=emergent-badge"
        target="_blank"
        rel="noopener noreferrer"
        className="emergent-badge"
        data-testid="emergent-badge"
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

export default LandingPage;
