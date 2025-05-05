import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, DollarSign, AlertCircle, ChevronRight, Loader, BarChart3, Percent } from 'lucide-react';

const Investment = ({ transactions }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setLoading(true);
      const fetchRecommendations = async () => {
        const recommendationsFromAPI = await investmentRecommendationsFromAI(transactions);
        setRecommendations(recommendationsFromAPI);
        setLoading(false);
      };

      fetchRecommendations();
    }
  }, [transactions]);

  const investmentRecommendationsFromAI = async (transactions) => {
    const GEMINI_API_KEY = "AIzaSyA6uSVWMWopA9O1l5F74QeeBw0vA4bU9o4"
    const prompt = `
        You are an investment analysis assistant. You will receive a JSON array called "transactions" where each investment has:
    - instrumentType: string (e.g., "stock", "bond", "etf", "crypto", "real_estate", "mutual_fund")
    - symbol: string
    - amount: number (investment amount)
    - purchaseDate: ISO date string
    - currentValue: number
    - annualReturn: number (percentage)
    - risk: string (one of "low", "medium", "high")

    Your task is to:
    1. Analyze portfolio diversification and identify potential concentration risks.
    2. Evaluate performance of different investment instruments relative to market benchmarks.
    3. Calculate overall portfolio risk profile and suggest adjustments based on risk tolerance.
    4. Identify underperforming investments that may need rebalancing.
    5. Suggest new investment opportunities based on current market conditions.
    6. Recommend "Diversification" strategies to balance the portfolio.
    7. Propose "Risk Management" tactics for the current portfolio.
    8. Point out "Tax Optimization" moves for investment holdings.
    9. Highlight "Growth Opportunities" in emerging markets or sectors.
    10. Suggest "Income Generation" strategies for the portfolio.

    Return only a JSON array of recommendation objects, each with these fields:
    - id: unique integer  
    - title: short title  
    - description: detailed actionable recommendation  
    - impact: one of ["High", "Medium", "Low"]  
    - category: one of ["Diversification","Risk Management","Tax Optimization","Growth Opportunities","Income Generation"]  
    - benefit: brief note on expected returns or benefits  
    - instrumentType: suggested investment instrument type
    
    Example output format:
    json
    [
      {
        "id": 1,
        "title": "Increase Bond Allocation",
        "description": "Consider increasing your bond allocation by 10% to reduce overall portfolio volatility during market downturns.",
        "impact": "Medium",
        "category": "Risk Management",
        "benefit": "Reduced volatility during downturns",
        "instrumentType": "bond"
      },
      ...
    ]

    EXTREMELY IMPORTANT: Your response must ONLY contain the raw JSON array. Do not include any explanations, markdown formatting, or code blocks. Just return the raw JSON array starting with [ and ending with ]. Nothing else.
    `
    // Call Gemini API
    try{
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
           body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt + "\n\nTransactions:\n" + JSON.stringify(transactions, null, 2) }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return [];
      
      const cleanedText = rawText.replace(/```json\s*|```/g, "").trim();

      console.log("Gemini response:", cleanedText); 

      try {
        return JSON.parse(cleanedText);
      } catch (err) {
        console.error("Failed to parse Gemini response:", cleanedText);
        return [];
      }
    } catch (error){
      console.error(error);
      return [];
    }
  }

  const getInstrumentIcon = (instrumentType) => {
    switch (instrumentType) {
      case 'stock':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'bond':
        return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'etf':
        return <BarChart3 className="h-4 w-4 text-purple-400" />;
      case 'crypto':
        return <Percent className="h-4 w-4 text-yellow-400" />;
      default:
        return <LineChart className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Investment Analysis</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Diversification</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Diversification').length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>Portfolio balance opportunities</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Growth Potential</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Growth Opportunities').length}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>High return investment options</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">High Priority</h3>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.impact === 'High').length}</p>
          <p className="text-sm text-yellow-500 mt-2 flex items-center">
            <span>Require immediate attention</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          AI-Generated Investment Recommendations
        </h2>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-2">
            <Loader className="animate-spin text-white h-6 w-6" />
            <div className="text-white text-sm">Analyzing with Gemini AI...</div>
          </div>
        ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-800/80 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/30">
                    {getInstrumentIcon(recommendation.instrumentType)}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-white">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recommendation.impact === 'High' 
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : recommendation.impact === 'Medium'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {recommendation.impact} Impact
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">{recommendation.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{recommendation.category}</span>
                    <span className="text-xs font-medium text-green-400">{recommendation.benefit}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 ml-12">
                <button
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setSelectedRecommendation(recommendation)}
                >
                  <span>View details</span>
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              {selectedRecommendation?.id === recommendation.id && (
                <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <h4 className="text-white font-bold mb-2">{selectedRecommendation.title}</h4>
                  <p className="text-gray-300">{selectedRecommendation.description}</p>
                  <p className="text-sm text-blue-300 mt-2">
                    <strong>Impact:</strong> {selectedRecommendation.impact} <br />
                    <strong>Category:</strong> {selectedRecommendation.category} <br />
                    <strong>Benefit:</strong> {selectedRecommendation.benefit} <br />
                    <strong>Instrument Type:</strong> {selectedRecommendation.instrumentType}
                  </p>
                  <button
                    className="mt-2 text-xs text-red-400 hover:underline"
                    onClick={() => setSelectedRecommendation(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Investment Strategy
        </h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300">
            Our AI has analyzed your portfolio data and market conditions to generate these investment recommendations. 
            To optimize your investment strategy, we suggest implementing them in the following order:
          </p>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-2">
              <Loader className="animate-spin text-white h-6 w-6" />
              <div className="text-white text-sm">Analyzing with Gemini AI...</div>
            </div>
          ) : (
          <ol className="mt-4 space-y-2 pl-5 list-decimal text-gray-300">
            {recommendations
              .sort((a, b) => {
                if (a.impact === 'High' && b.impact !== 'High') return -1;
                if (a.impact !== 'High' && b.impact === 'High') return 1;
                return 0;
              })
              .map((rec, index) => (
                <li key={rec.id}>{rec.title}</li>
              ))}
          </ol>
          )}
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <p className="text-sm text-blue-300">
              <strong>Pro Tip:</strong> Consider consulting with a financial advisor before making significant changes to your investment portfolio.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Investment Instruments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-white font-medium">Stocks</h3>
            </div>
            <p className="text-sm text-gray-300">
              Ownership shares in publicly traded companies. Higher risk with potential for higher returns through price appreciation and dividends.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
              Growth Potential
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <DollarSign className="h-5 w-5 text-green-400 mr-2" />
              <h3 className="text-white font-medium">Bonds</h3>
            </div>
            <p className="text-sm text-gray-300">
              Fixed-income debt securities. Lower risk with predictable returns through regular interest payments and principal repayment at maturity.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
              Income Generation
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-white font-medium">ETFs</h3>
            </div>
            <p className="text-sm text-gray-300">
              Exchange-Traded Funds that track indexes, sectors, or assets. Offers diversification with the flexibility of trading like stocks.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400">
              Diversification
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Percent className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-white font-medium">Cryptocurrencies</h3>
            </div>
            <p className="text-sm text-gray-300">
              Digital or virtual currencies using cryptography for security. High volatility with potential for significant returns.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
              High Risk/Reward
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <LineChart className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-white font-medium">Real Estate</h3>
            </div>
            <p className="text-sm text-gray-300">
              Physical property or REITs (Real Estate Investment Trusts). Provides passive income through rent and potential capital appreciation.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
              Tangible Asset
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <LineChart className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-white font-medium">Mutual Funds</h3>
            </div>
            <p className="text-sm text-gray-300">
              Professionally managed investment funds pooled from multiple investors. Offers diversification and professional management.
            </p>
            <span className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
              Professional Management
            </span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
          <p className="text-sm text-blue-300">
            <strong>Investment Tip:</strong> A well-diversified portfolio typically includes a mix of these instruments based on your risk tolerance, time horizon, and financial goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Investment;