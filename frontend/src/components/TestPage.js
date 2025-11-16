import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config;

  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (!config) {
      navigate("/");
      return;
    }

    const startTest = async () => {
      try {
        const response = await axios.post(`${API}/test/start`, config);
        setQuestions(response.data.questions);
        setTestId(response.data.test_id);
        setTotalQuestions(response.data.total_questions);
        setAnswers(new Array(response.data.total_questions).fill(-1));
        setTimeRemaining(response.data.time_limit);
        setStartTime(Date.now());
        setLoading(false);
      } catch (error) {
        console.error("Error starting test:", error);
        navigate("/");
      }
    };

    startTest();
  }, [config, navigate]);

  useEffect(() => {
    if (loading || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const handleSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      const response = await axios.post(`${API}/test/submit`, {
        test_id: testId,
        answers: answers,
        time_taken: timeTaken,
        age: config.age,
      });
      navigate("/results", { state: { result: response.data, config } });
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const getAnsweredCount = () => answers.filter((a) => a !== -1).length;
  const getProgressPercentage = () =>
    ((currentQuestion + 1) / totalQuestions) * 100;

  if (loading) {
    return (
      <div className="test-container">
        <div className="question-card">
          <div className="loading-spinner"></div>
          <p
            style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}
          >
            Preparing your personalized test...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-container">
        <div className="question-card">
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No questions available
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="test-container">
      <div className="test-header-advanced">
        <div className="test-info-group">
          <div className="test-progress-bar-container">
            <div
              className="test-progress-bar"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="test-progress-text" data-testid="test-progress">
            Question {currentQuestion + 1} of {totalQuestions} ·{" "}
            {getAnsweredCount()} answered
          </div>
        </div>
        <div
          className={`test-timer-advanced ${isLowTime ? "warning" : ""}`}
          data-testid="test-timer"
        >
          <Clock size={20} />
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="question-card-advanced">
        <div className="question-header">
          <div
            className="question-category-advanced"
            data-testid="question-category"
          >
            {question.category.toUpperCase()}
          </div>
          <div className="question-number">#{currentQuestion + 1}</div>
        </div>

        <div className="question-text-advanced" data-testid="question-text">
          {question.question_text}
        </div>

        <div className="options-list-advanced">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn-advanced ${
                selectedAnswer === index ? "selected" : ""
              }`}
              onClick={() => handleAnswerSelect(index)}
              data-testid={`option-${index}`}
            >
              <div className="option-letter">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="option-text">{option}</div>
              {selectedAnswer === index && (
                <div className="option-checkmark">✓</div>
              )}
            </button>
          ))}
        </div>

        <div className="test-navigation-advanced">
          <button
            className="nav-btn-advanced secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="previous-btn"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="question-dots">
            {questions
              .slice(
                Math.max(0, currentQuestion - 2),
                Math.min(questions.length, currentQuestion + 3)
              )
              .map((_, idx) => {
                const actualIdx = Math.max(0, currentQuestion - 2) + idx;
                return (
                  <div
                    key={actualIdx}
                    className={`question-dot ${
                      actualIdx === currentQuestion ? "active" : ""
                    } ${answers[actualIdx] !== -1 ? "answered" : ""}`}
                  />
                );
              })}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              className="nav-btn-advanced primary"
              onClick={handleSubmit}
              data-testid="submit-btn"
            >
              Submit Test
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className="nav-btn-advanced primary"
              onClick={handleNext}
              data-testid="next-btn"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
