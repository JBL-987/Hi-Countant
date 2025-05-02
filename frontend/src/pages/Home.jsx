import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Spline from "@splinetool/react-spline";

export default function Home({ isAuthenticated, login }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("track");
  const heroref = useRef(null);

  const handleLogin = async () => {
      try {
        await login();
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Error connecting to ICP",
          text: "Something went wrong!",
        });
      }
    };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      id: "track",
      icon: <Calculator className="h-6 w-6" />,
      title: "Track",
      description:
        "Automatically categorize transactions and generate financial statements",
    },
    {
      id: "audit",
      icon: <FileText className="h-6 w-6" />,
      title: "Audit",
      description:
        "Log changes, highlight inconsistencies, and ensure compliance",
    },
    {
      id: "estimate",
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Estimate",
      description: "Forecast cash flow and compare budget vs actual data",
    },
    {
      id: "independent",
      icon: <Briefcase className="h-6 w-6" />,
      title: "Independent",
      description: "Generate journal entries and answer accounting questions",
    },
  ];

  const testimonials = [
    {
      quote:
        "Hi! Countant has completely transformed how I manage my small business finances. The AI is incredibly accurate!",
      author: "Sarah J., Small Business Owner",
    },
    {
      quote:
        "As a freelancer, keeping track of finances was always a pain. This platform makes it effortless and actually enjoyable.",
      author: "Michael T., Freelance Designer",
    },
    {
      quote:
        "The forecasting features have helped us make better financial decisions. It's like having a CPA on call 24/7.",
      author: "Lisa R., Startup Founder",
    },
  ];

  const benefits = [
    "Save thousands on traditional accounting services",
    "Get real-time financial insights 24/7",
    "Automate tedious bookkeeping tasks",
    "Ensure compliance with accounting standards",
    "Make data-driven financial decisions",
    "Simplify tax preparation",
  ];

  return (
    <main className="overflow-hidden">
      <div className="bg-black text-white">
        {/* Hero Section */}
        <section ref={heroref} className="min-h-screen relative flex flex-col justify-center items-center p-4 pt-16">
          <div className="absolute inset-0 z-0">
            <Spline scene="https://prod.spline.design/44ZWgH6sCPd9Ny-a/scene.splinecode" />
          </div>
          <div className="max-w-5xl z-20 text-center relative">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your AI Accountant on the Blockchain
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Hi! Countant replaces traditional accountants with powerful AI that handles all your financial needs securely on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-medium hover:opacity-90 transition-all transform hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white/30 rounded-lg text-lg font-medium hover:bg-white/10 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Four Powerful AI Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`p-4 rounded-lg transition-all ${
                    activeTab === feature.id
                      ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50"
                      : "bg-gray-900/50 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`p-3 rounded-full mb-3 ${
                        activeTab === feature.id ? "bg-blue-600" : "bg-gray-800"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 md:p-8 border border-blue-500/20">
              {activeTab === "track" && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400">
                      Track Module
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Our Track module connects to your bank accounts and
                      automatically categorizes transactions using advanced AI. It
                      generates accurate financial statements including Profit &
                      Loss and Balance Sheets with minimal input from you.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Automatic transaction categorization</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Real-time financial statements</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Bank account integration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Custom categorization rules</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-blue-500/20">
                    <div className="aspect-video bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
                      <Calculator className="h-20 w-20 text-blue-400 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "audit" && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400">
                      Audit Module
                    </h3>
                    <p className="text-gray-300 mb-6">
                      The Audit module provides comprehensive oversight of your
                      financial data. It logs every change, highlights
                      inconsistencies, and ensures compliance with accounting
                      standards like GAAP, IFRS, and PSAK.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Complete audit trail of all changes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Automatic inconsistency detection</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Compliance with accounting standards</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Risk assessment reports</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-blue-500/20">
                    <div className="aspect-video bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
                      <FileText className="h-20 w-20 text-blue-400 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "estimate" && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400">
                      Estimate Module
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Our Estimate module uses AI to forecast your financial
                      future. It predicts cash flow, compares budget versus actual
                      data, and simulates different financial scenarios to help
                      you make informed decisions.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>AI-powered cash flow forecasting</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Budget vs. actual comparison</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Financial scenario simulation</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Trend analysis and projections</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-blue-500/20">
                    <div className="aspect-video bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-20 w-20 text-blue-400 opacity-70" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "independent" && (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400">
                      Independent Module
                    </h3>
                    <p className="text-gray-300 mb-6">
                      The Independent module acts as your personal accounting
                      assistant. It generates journal entries from natural
                      language instructions and answers your accounting questions
                      through text or voice input.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Natural language journal entries</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Voice and text accounting Q&A</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Accounting advice and guidance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Financial document interpretation</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-blue-500/20">
                    <div className="aspect-video bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-20 w-20 text-blue-400 opacity-70" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 bg-gradient-to-b bg-black">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Why Choose Hi! Countant?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 p-6 rounded-xl border border-blue-500/20">
                <h3 className="text-2xl font-bold mb-6 text-blue-400">
                  Benefits
                </h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/40 p-6 rounded-xl border border-blue-500/20">
                <h3 className="text-2xl font-bold mb-6 text-blue-400">
                  Powered By
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-black/30 rounded-lg">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold">G</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Gemini AI</h4>
                      <p className="text-sm text-gray-400">
                        Advanced AI for financial analysis
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-black/30 rounded-lg">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold">IC</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Internet Computer</h4>
                      <p className="text-sm text-gray-400">
                        Secure blockchain infrastructure
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-black/30 rounded-lg">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold">II</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Internet Identity</h4>
                      <p className="text-sm text-gray-400">
                        Anonymous authentication
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20"
                >
                  <p className="text-gray-300 mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-semibold text-blue-400">
                    {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-t bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Ready to Replace Your Accountant?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses that have switched to Hi! Countant for
              their accounting needs.
            </p>
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-medium hover:opacity-90 transition-all transform hover:scale-105 flex items-center mx-auto">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
