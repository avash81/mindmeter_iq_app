import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
        setAnswers(new Array(response.data.questions.length).fill(-1));
        setTimeRemaining(response.data.duration_minutes * 60);
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
    try {
      const response = await axios.post(`${API}/test/submit`, {
        test_id: testId,
        answers: answers,
      });
      navigate("/results", { state: { result: response.data } });
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  if (loading) {
    return (
      <div className="test-container">
        <div className="question-card">
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Loading test...
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

  return (
    <div className="test-container">
      <div className="test-header">
        <div className="test-progress" data-testid="test-progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="test-timer" data-testid="test-timer">
          Time: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="question-card">
        <div className="question-category" data-testid="question-category">
          {question.category}
        </div>
        <div className="question-text" data-testid="question-text">
          {question.question_text}
        </div>

        <div className="options-list">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                selectedAnswer === index ? "selected" : ""
              }`}
              onClick={() => handleAnswerSelect(index)}
              data-testid={`option-${index}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="test-navigation">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="previous-btn"
          >
            Previous
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button
              className="nav-btn primary"
              onClick={handleSubmit}
              data-testid="submit-btn"
            >
              Submit Test
            </button>
          ) : (
            <button
              className="nav-btn primary"
              onClick={handleNext}
              data-testid="next-btn"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
