import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Trophy,
  Clock,
  Target,
  RotateCcw,
  Home,
  Share2,
  Download,
  Award,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchResults();
    }
  }, [testId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/test/result/${testId}`);
      setResults(response.data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      toast.error("Failed to load test results. Please try again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (level) => {
    switch (level?.toLowerCase()) {
      case "superior":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "above average":
        return "bg-green-100 text-green-700 border-green-200";
      case "high average":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "average":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "below average":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getIQDescription = (iqScore) => {
    if (iqScore >= 130) {
      return "Your score indicates superior intellectual ability. You excel at complex problem-solving and abstract reasoning.";
    } else if (iqScore >= 120) {
      return "Your score shows above-average intelligence. You demonstrate strong analytical and logical thinking skills.";
    } else if (iqScore >= 110) {
      return "Your score reflects high-average intelligence with good problem-solving capabilities.";
    } else if (iqScore >= 90) {
      return "Your score indicates average intelligence with solid cognitive abilities.";
    } else {
      return "Your score suggests room for improvement in logical reasoning and pattern recognition.";
    }
  };

  const shareResults = () => {
    const shareText = `I just completed the MindMeter IQ Test and scored ${results.iq_score_estimate}! Test your intelligence at MindMeter.`;

    if (navigator.share) {
      navigator.share({
        title: "MindMeter IQ Test Results",
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Results copied to clipboard!");
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setDownloading(true);
      const response = await axios.post(
        `${API}/certificate/download`,
        {
          test_id: testId,
          name: certForm.name,
          email: certForm.email,
          contact: certForm.contact,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `MindMeter_Certificate_${certForm.name.replace(/ /g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Certificate downloaded successfully!");
      setShowCertModal(false);
      setCertForm({ name: "", email: "", contact: "" });
    } catch (error) {
      console.error("Failed to download certificate:", error);
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mindmeter-icon mb-4 mx-auto loading-pulse"></div>
          <p className="text-lg text-gray-600">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Results not found.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={shareResults}
                className="flex items-center gap-2"
                data-testid="share-results-button"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Results Card */}
        <Card className="mb-8 shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10" />
              </div>
            </div>
            <CardTitle
              className="text-4xl font-bold mb-2"
              data-testid="iq-score"
            >
              IQ Score: {results.iq_score_estimate}
            </CardTitle>
            <Badge
              className={`text-lg px-4 py-2 ${getPerformanceColor(
                results.performance_level
              )}`}
            >
              {results.performance_level}
            </Badge>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-600 text-center text-lg leading-relaxed mb-8">
              {getIQDescription(results.iq_score_estimate)}
            </p>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div
                  className="text-2xl font-bold text-green-700"
                  data-testid="correct-answers"
                >
                  {results.correct_answers}
                </div>
                <div className="text-sm text-green-600">Correct</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div
                  className="text-2xl font-bold text-red-700"
                  data-testid="incorrect-answers"
                >
                  {results.incorrect_answers}
                </div>
                <div className="text-sm text-red-600">Incorrect</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">
                  %
                </div>
                <div
                  className="text-2xl font-bold text-blue-700"
                  data-testid="accuracy-percentage"
                >
                  {results.accuracy_percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-blue-600">Accuracy</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div
                  className="text-2xl font-bold text-orange-700"
                  data-testid="average-time"
                >
                  {results.average_time_per_question.toFixed(0)}s
                </div>
                <div className="text-sm text-orange-600">Avg Time</div>
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Performance
                </span>
                <span className="text-sm text-gray-500">
                  {results.correct_answers}/{results.total_questions} questions
                </span>
              </div>
              <Progress value={results.accuracy_percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Certificate Download Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Download Your Certificate
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get a personalized certificate with your results
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowCertModal(true)}
                className="btn-primary text-white flex items-center gap-2"
                data-testid="download-certificate-button"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* IQ Scale Explanation */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Understanding Your IQ Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-700">130+</div>
                <div className="text-xs text-purple-600">Superior</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-700">120-129</div>
                <div className="text-xs text-green-600">Above Average</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-700">110-119</div>
                <div className="text-xs text-blue-600">High Average</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-700">90-109</div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="font-semibold text-orange-700">80-89</div>
                <div className="text-xs text-orange-600">Below Average</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              This IQ test measures logical reasoning and pattern recognition
              abilities.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 px-8 py-3"
            data-testid="back-to-home-button"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="btn-primary text-white flex items-center gap-2 px-8 py-3"
            data-testid="retake-test-button"
          >
            <RotateCcw className="w-5 h-5" />
            Take Test Again
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            <strong>Disclaimer:</strong> This test provides an estimate of
            cognitive abilities in specific areas. It should not be used as a
            comprehensive assessment of intelligence or for diagnostic purposes.
          </p>
        </div>
      </div>

      {/* Certificate Download Modal */}
      <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Download Your Certificate
            </DialogTitle>
            <DialogDescription>
              Please provide your details to generate your personalized
              certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={certForm.name}
                onChange={(e) =>
                  setCertForm({ ...certForm, name: e.target.value })
                }
                data-testid="cert-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={certForm.email}
                onChange={(e) =>
                  setCertForm({ ...certForm, email: e.target.value })
                }
                data-testid="cert-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number (Optional)</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="+1 234 567 8900"
                value={certForm.contact}
                onChange={(e) =>
                  setCertForm({ ...certForm, contact: e.target.value })
                }
                data-testid="cert-contact-input"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCertModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadCertificate}
              disabled={downloading || !certForm.name.trim()}
              className="flex-1 btn-primary text-white"
              data-testid="cert-download-button"
            >
              {downloading ? "Downloading..." : "Download Certificate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsPage;
