import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, Home } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config || {
    duration: "medium",
    question_types: ["all"],
    difficulty: "medium",
  };

  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startTest();
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, currentIndex, questions]);

  const startTest = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/test/start`, config);
      setTestId(response.data.test_id);
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(-1));
    } catch (error) {
      console.error("Failed to start test:", error);
      toast.error("Failed to start test. Please try again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer !== null ? selectedAnswer : -1;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    try {
      setSubmitting(true);
      const response = await axios.post(`${API}/test/submit`, {
        test_id: testId,
        answers: finalAnswers,
      });
      navigate(`/results/${testId}`);
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mindmeter-icon mb-4 mx-auto loading-pulse"></div>
          <p className="text-lg text-gray-600">Preparing your IQ test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Logo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="mindmeter-logo"
              onClick={() => navigate("/")}
              data-testid="logo-home-link"
            >
              <div className="mindmeter-icon"></div>
              <span>MindMeter</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
              data-testid="exit-test-button"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit Test
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-2xl font-bold text-gray-900"
              data-testid="question-progress"
            >
              Question {currentIndex + 1} of {questions.length}
            </h1>
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span data-testid="time-remaining">{timeLeft}s</span>
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-2"
            data-testid="test-progress"
          />
        </div>

        {/* Social Proof Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-8">
          <p className="text-orange-800 text-center text-sm">
            Over 1,000,000 tests completed worldwide
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">
              <Badge variant="secondary" className="text-xs">
                {currentQuestion?.category?.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-center text-lg font-medium text-gray-800">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selectedAnswer === index
                      ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                  data-testid={`option-${index}`}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || submitting}
                size="lg"
                className="btn-primary text-white px-8 py-3 text-lg font-semibold rounded-xl"
                data-testid="next-question-button"
              >
                {submitting
                  ? "Submitting..."
                  : currentIndex < questions.length - 1
                  ? "Next Question"
                  : "Submit Test"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 text-sm">
            <strong>Tip:</strong> Take your time and think carefully. Each
            question has a logical solution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
