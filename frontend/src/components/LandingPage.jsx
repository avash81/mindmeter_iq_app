import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Brain, Target } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const [duration, setDuration] = useState("medium");
  const [questionTypes, setQuestionTypes] = useState(["all"]);
  const [difficulty, setDifficulty] = useState("medium");

  const toggleQuestionType = (type) => {
    if (type === "all") {
      setQuestionTypes(["all"]);
    } else {
      if (questionTypes.includes("all")) {
        setQuestionTypes([type]);
      } else {
        if (questionTypes.includes(type)) {
          const newTypes = questionTypes.filter((t) => t !== type);
          setQuestionTypes(newTypes.length === 0 ? ["all"] : newTypes);
        } else {
          setQuestionTypes([...questionTypes, type]);
        }
      }
    }
  };

  const handleStartTest = () => {
    const config = { duration, question_types: questionTypes, difficulty };
    navigate("/test", { state: { config } });
  };

  return (
    <div className="landing-hero">
      <div className="hero-content">
        <div className="flex items-center justify-center mb-6">
          <div className="mindmeter-icon" data-testid="logo-icon"></div>
        </div>
        <h1 className="hero-title" data-testid="hero-title">
          MindMeter
        </h1>
        <h2 className="hero-subtitle" data-testid="hero-subtitle">
          Discover Your Cognitive Potential
        </h2>
        <p className="hero-description" data-testid="hero-description">
          A comprehensive IQ test with carefully selected questions. Configure
          the test the way you like and get an instant IQ estimate. No signup
          required.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card" data-testid="feature-duration">
          <div className="feature-icon">
            <Clock size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Flexible Duration</h3>
          <p className="feature-text">
            Choose from short, medium or long test sessions.
          </p>
        </div>
        <div className="feature-card" data-testid="feature-categories">
          <div className="feature-icon">
            <Brain size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Multiple Categories</h3>
          <p className="feature-text">
            Pattern, math and verbal reasoning questions.
          </p>
        </div>
        <div className="feature-card" data-testid="feature-results">
          <div className="feature-icon">
            <Target size={32} color="#7c3aed" />
          </div>
          <h3 className="feature-title">Instant Results</h3>
          <p className="feature-text">
            Get your IQ score right after finishing the test.
          </p>
        </div>
      </div>

      <div className="config-section">
        <h2 className="config-title" data-testid="config-title">
          Configure Your Test
        </h2>

        <div className="config-group">
          <label className="config-label" data-testid="duration-label">
            Test Duration
          </label>
          <div className="duration-options">
            <div
              className={`duration-card ${
                duration === "short" ? "selected" : ""
              }`}
              onClick={() => setDuration("short")}
              data-testid="duration-short"
            >
              <div className="duration-name">Short</div>
              <div className="duration-details">5 questions · ~5 min</div>
            </div>
            <div
              className={`duration-card ${
                duration === "medium" ? "selected" : ""
              }`}
              onClick={() => setDuration("medium")}
              data-testid="duration-medium"
            >
              <div className="duration-name">Medium</div>
              <div className="duration-details">10 questions · ~10 min</div>
            </div>
            <div
              className={`duration-card ${
                duration === "long" ? "selected" : ""
              }`}
              onClick={() => setDuration("long")}
              data-testid="duration-long"
            >
              <div className="duration-name">Long</div>
              <div className="duration-details">20 questions · ~20 min</div>
            </div>
          </div>
        </div>

        <div className="config-group">
          <label className="config-label" data-testid="types-label">
            Question Types
          </label>
          <div className="type-buttons">
            <button
              className={`type-btn ${
                questionTypes.includes("all") ? "selected" : ""
              }`}
              onClick={() => toggleQuestionType("all")}
              data-testid="type-all"
            >
              All Types
            </button>
            <button
              className={`type-btn ${
                questionTypes.includes("pattern") ? "selected" : ""
              }`}
              onClick={() => toggleQuestionType("pattern")}
              data-testid="type-pattern"
            >
              Pattern Recognition
            </button>
            <button
              className={`type-btn ${
                questionTypes.includes("math") ? "selected" : ""
              }`}
              onClick={() => toggleQuestionType("math")}
              data-testid="type-math"
            >
              Mathematical
            </button>
            <button
              className={`type-btn ${
                questionTypes.includes("verbal") ? "selected" : ""
              }`}
              onClick={() => toggleQuestionType("verbal")}
              data-testid="type-verbal"
            >
              Verbal
            </button>
          </div>
        </div>

        <div className="config-group">
          <label className="config-label" data-testid="difficulty-label">
            Difficulty Level
          </label>
          <div className="difficulty-options">
            <div
              className={`difficulty-card ${
                difficulty === "easy" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("easy")}
              data-testid="difficulty-easy"
            >
              <div className="difficulty-level">Easy</div>
              <div className="difficulty-desc">Beginner Friendly</div>
            </div>
            <div
              className={`difficulty-card ${
                difficulty === "medium" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("medium")}
              data-testid="difficulty-medium"
            >
              <div className="difficulty-level">Medium</div>
              <div className="difficulty-desc">Standard Level</div>
            </div>
            <div
              className={`difficulty-card ${
                difficulty === "hard" ? "selected" : ""
              }`}
              onClick={() => setDifficulty("hard")}
              data-testid="difficulty-hard"
            >
              <div className="difficulty-level">Hard</div>
              <div className="difficulty-desc">Advanced</div>
            </div>
          </div>
        </div>

        <button
          className="start-btn"
          onClick={handleStartTest}
          data-testid="start-test-btn"
        >
          Start IQ Test
        </button>

        <p className="disclaimer">Instant results · No registration required</p>
      </div>
    </div>
  );
};

export default LandingPage;
