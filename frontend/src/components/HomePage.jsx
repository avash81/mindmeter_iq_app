import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Users,
  Clock,
  Award,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    tests_completed_last_30_days: 0,
    total_tests_completed: 0,
    total_questions_answered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    navigate("/test");
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Matrix Reasoning",
      description:
        "Advanced pattern recognition tests that challenge your logical thinking abilities",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Results",
      description:
        "Get your IQ score immediately after completing the test with detailed analysis",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Scientifically Designed",
      description:
        "Questions based on established psychometric principles and cognitive research",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Adaptive Difficulty",
      description:
        "Questions adapt to your skill level for accurate measurement",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="mindmeter-logo">
              <div className="mindmeter-icon"></div>
              <span>MindMeter</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <Brain className="w-4 h-4 mr-2" />
            Professional IQ Assessment
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Test Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Intelligence
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover your cognitive abilities with our scientifically designed
            IQ test. Get accurate results in just 8 questions with matrix
            reasoning challenges.
          </p>

          {/* Stats Banner */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 stats-counter">
                {loading
                  ? "---"
                  : stats.tests_completed_last_30_days.toLocaleString()}
              </span>
              <span className="text-gray-600">
                tests completed in the last 30 days
              </span>
            </div>
          </div>

          <Button
            onClick={startTest}
            size="lg"
            className="btn-primary text-white px-8 py-4 text-lg font-semibold rounded-xl h-auto"
            data-testid="start-test-button"
          >
            Start IQ Test
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>8 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MindMeter?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our advanced assessment platform provides accurate, reliable IQ
              measurements using cutting-edge cognitive testing methods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-700 border-0 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Discover Your IQ?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of people who have already tested their
                intelligence with MindMeter.
              </p>
              <Button
                onClick={startTest}
                size="lg"
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl h-auto"
              >
                Begin Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="mindmeter-logo text-white mb-4">
                <div className="mindmeter-icon"></div>
                <span>MindMeter</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Professional IQ testing platform designed to accurately measure
                cognitive abilities through scientific methods.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2">
                <p className="text-gray-400">IQ Assessment</p>
                <p className="text-gray-400">Matrix Reasoning</p>
                <p className="text-gray-400">Cognitive Analysis</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-2">
                <p className="text-gray-400">
                  {loading
                    ? "Loading..."
                    : `${stats.total_tests_completed.toLocaleString()} Total Tests`}
                </p>
                <p className="text-gray-400">
                  {loading
                    ? "Loading..."
                    : `${stats.total_questions_answered.toLocaleString()} Questions Answered`}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 MindMeter. Professional cognitive assessment platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
