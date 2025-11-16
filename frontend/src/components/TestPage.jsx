import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PatternCell = ({
  pattern,
  isQuestionMark = false,
  isSelectable = false,
  isSelected = false,
  onClick,
}) => {
  const getPatternClass = () => {
    if (isQuestionMark) return "question-mark";
    if (!pattern) return "";
    return `pattern-${pattern.replace(/_/g, "-")}`;
  };

  return (
    <div
      className={`pattern-cell ${isSelectable ? "selectable" : ""} ${
        isSelected ? "selected" : ""
      } ${getPatternClass()}`}
      onClick={onClick}
      data-testid={`pattern-${pattern || "question-mark"}`}
    >
      {isQuestionMark && "?"}
    </div>
  );
};

const TestPage = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Initialize test
  useEffect(() => {
    startTest();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitAnswer(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, timeLeft]);

  const startTest = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/test/start`);
      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setSessionInfo(response.data.session_info);
      setTimeLeft(response.data.question.time_limit_seconds || 60);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to start test:", error);
      toast.error("Failed to start test. Please try again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerIndex = null, isTimeout = false) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const answer = isTimeout
        ? -1
        : answerIndex !== null
        ? answerIndex
        : selectedAnswer;

      const response = await axios.post(`${API}/test/answer`, {
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_answer: answer,
        time_taken_seconds: timeTaken,
      });

      if (response.data.test_completed) {
        // Test completed, redirect to results
        navigate(`/results/${sessionId}`);
      } else {
        // Load next question
        setCurrentQuestion(response.data.question);
        setSessionInfo(response.data.session_info);
        setTimeLeft(response.data.question.time_limit_seconds || 60);
        setSelectedAnswer(null);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPatternGrid = () => {
    if (!currentQuestion?.pattern_data?.grid) return null;

    const grid = currentQuestion.pattern_data.grid;
    return (
      <div className="pattern-grid">
        {grid.flat().map((cell, index) => (
          <PatternCell
            key={index}
            pattern={cell.pattern === "missing" ? null : cell.pattern}
            isQuestionMark={cell.pattern === "missing"}
          />
        ))}
      </div>
    );
  };

  const renderAnswerOptions = () => {
    if (!currentQuestion?.options) return null;

    return (
      <div className="pattern-options">
        {currentQuestion.options.map((option, index) => (
          <PatternCell
            key={index}
            pattern={option.pattern}
            isSelectable={true}
            isSelected={selectedAnswer === index}
            onClick={() => setSelectedAnswer(index)}
          />
        ))}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="mindmeter-logo">
              <div className="mindmeter-icon"></div>
              <span>MindMeter</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
              data-testid="back-to-home-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              Question {sessionInfo?.current_question} of{" "}
              {sessionInfo?.total_questions}
            </h1>
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span data-testid="time-remaining">{timeLeft}s</span>
            </Badge>
          </div>
          <Progress
            value={sessionInfo?.progress_percentage || 0}
            className="h-2"
            data-testid="test-progress"
          />
        </div>

        {/* Social Proof Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-8">
          <p className="text-orange-800 text-center text-sm">
            🌍 Over 1,000,000 tests completed worldwide
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium text-gray-800">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Pattern Grid */}
            <div className="flex justify-center">{renderPatternGrid()}</div>

            {/* Answer Options */}
            <div className="flex justify-center">{renderAnswerOptions()}</div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                onClick={() => handleSubmitAnswer()}
                disabled={selectedAnswer === null || submitting}
                size="lg"
                className="btn-primary text-white px-8 py-3 text-lg font-semibold rounded-xl"
                data-testid="submit-answer-button"
              >
                {submitting ? "Submitting..." : "Next Question"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Look for patterns in rows and columns. Each
            question has a logical solution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
