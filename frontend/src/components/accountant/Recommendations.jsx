import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, DollarSign, AlertCircle, ChevronRight, Loader } from 'lucide-react';

const Recommendations = ({ transactions }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setLoading(true);
      const fetchRecommendations = async () => {
        const recommendationsFromAPI = await recommendationsFromAI(transactions);
        setRecommendations(recommendationsFromAPI);
        setLoading(false);
      };

      fetchRecommendations();
    }
  }, [transactions]);

  const recommendationsFromAI = async (transactions) => {
    const GEMINI_API_KEY = "AIzaSyA6uSVWMWopA9O1l5F74QeeBw0vA4bU9o4"
    const prompt = `
        You are a financial analysis assistant. You will receive a JSON array called “transactions” where each transaction has:
    - transactionType: "income" or "expense"
    - amount: number
    - date: ISO date string
    - category: string (for expenses)
    - taxDeductible: boolean

    Your task is to:
    1. Analyze monthly cash flow and identify any months where expenses exceed income.
    2. Categorize and rank expense categories by total spend.
    3. Calculate the percentage of expenses that are tax-deductible.
    4. Detect any transactions that significantly deviate (e.g., >2×) from the average transaction amount.
    5. Identify recurring patterns or seasonality in cash flow.
    6. Suggest additional “Revenue Generation” opportunities.
    7. Recommend “Expense Reduction” strategies.
    8. Propose “Cash Flow Optimization” tactics (e.g., invoicing terms, reserves).
    9. Point out “Tax Optimization” moves.
    10. Highlight any “Risk Management” or “Debt Management” considerations.

    Return only a JSON array of recommendation objects, each with these fields:
    - id: unique integer  
    - title: short title  
    - description: detailed actionable recommendation  
    - impact: one of ["High", "Medium", "Low"]  
    - category: one of ["Revenue Generation","Expense Reduction","Cash Flow Optimization","Tax Optimization","Risk Management","Debt Management"]  
    - savings: brief note on expected savings or benefits  
    
    Example output format:
    json
    [
      {
        "id": 1,
        "title": "Negotiate Longer Payment Terms",
        "description": "Extend supplier payment terms from 30 to 60 days to improve cash liquidity during low-revenue months.",
        "impact": "High",
        "category": "Cash Flow Optimization",
        "savings": "Improved working capital"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Recommendations</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Process Improvements</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Process Improvement').length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>Efficiency opportunities</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Cost Reduction</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Cost Reduction').length}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>Potential savings opportunities</span>
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
          AI-Generated Recommendations
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
                    <Lightbulb className="h-4 w-4 text-blue-400" />
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
                    <span className="text-xs font-medium text-green-400">{recommendation.savings}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 ml-12">
                <button className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <span>View details</span>
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Implementation Plan
        </h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300">
            Our AI has analyzed your financial data and business operations to generate these recommendations. 
            To maximize the benefits, we suggest implementing them in the following order:
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
              <strong>Pro Tip:</strong> Schedule a meeting with your team to review these recommendations and assign responsibilities for implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
