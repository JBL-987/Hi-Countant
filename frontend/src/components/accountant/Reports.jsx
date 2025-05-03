import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Share2, Loader2 } from 'lucide-react';

const Reports = ({ transactions }) => {
  const [financialStatements, setFinancialStatements] = useState([]);
  const [taxReports, setTaxReports] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState({});
  const [incomeStatement, setIncomeStatement] = useState({});
  const [cashFlowStatement, setCashFlowStatement] = useState({});
  const [quarterlyTaxSummary, setQuarterlyTaxSummary] = useState({});
  const [annualTaxReport, setAnnualTaxReport] = useState({});
  const [salesTaxReport, setSalesTaxReport] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const fetchFinancialData = async () => {
        setLoading(true);
        const statements = await recommendationsFromAI(dummyData);
        if (statements && statements.length === 6) {
          const [ balanceData, incomeData, cashFlowData, quarterlyTaxData, annualTaxData, salesTaxData ] = statements;
  
          setBalanceSheet(balanceData?.balance_sheet || {});
          setIncomeStatement(incomeData?.income_statement || {});
          setCashFlowStatement(cashFlowData?.cash_flow_statement || {});
          setQuarterlyTaxSummary(quarterlyTaxData?.quarterly_tax_summary || {});
          setAnnualTaxReport(annualTaxData?.annual_tax_report || {});
          setSalesTaxReport(salesTaxData?.sales_tax_report || {});
  
          setFinancialStatements([
            balanceData?.balance_sheet,
            incomeData?.income_statement,
            cashFlowData?.cash_flow_statement,
          ]);
          setTaxReports([
            quarterlyTaxData?.quarterly_tax_summary,
            annualTaxData?.annual_tax_report,
            salesTaxData?.sales_tax_report
          ]);
          setLoading(false);
        }
      };
  
      fetchFinancialData();
    }
  }, [transactions]);

  const dummyData = {
      "businessInfo": {
        "name": "Hi-Countant",
        "fiscalYear": 2024,
        "reportingMonth": "May",
        "industry": "Accountant Services"
      },
      "revenue": {
        "sources": [
          { "source": "Website Development", "amount": 4500.00 },
          { "source": "App Maintenance", "amount": 1200.00 },
          { "source": "Consulting", "amount": 800.00 }
        ],
        "total": 6500.00
      },
      "expenses": {
        "categories": [
          { "category": "Office Supplies", "amount": 125.50 },
          { "category": "Salaries", "amount": 3000.00 },
          { "category": "Utilities", "amount": 200.00 },
          { "category": "Rent", "amount": 1200.00 },
          { "category": "Internet & Phone", "amount": 100.00 },
          { "category": "Travel", "amount": 250.00 }
        ],
        "total": 4875.50
      },
      "budget": {
        "revenue": 7000.00,
        "expenses": 5000.00
      },
      "balanceSheet": {
        "assets": {
          "cash": 2000.00,
          "accountsReceivable": 1800.00,
          "officeEquipment": 3000.00,
          "inventory": 500.00,
          "total": 7300.00
        },
        "liabilities": {
          "accountsPayable": 800.00,
          "businessLoan": 2000.00,
          "total": 2800.00
        },
        "equity": {
          "ownersEquity": 3500.00,
          "retainedEarnings": 1000.00,
          "total": 4500.00
        }
      },
      "cashFlow": {
        "operating": {
          "cashFromSales": 6000.00,
          "cashPaid": -4500.00,
          "net": 1500.00
        },
        "investing": {
          "equipmentPurchase": -500.00,
          "net": -500.00
        },
        "financing": {
          "loanReceived": 1000.00,
          "loanRepayment": -250.00,
          "net": 750.00
        },
        "netCashFlow": 1750.00
      },
      "taxes": {
        "compliance": {
          "incomeTaxLiability": 500.00,
          "salesTaxCollected": 130.00,
          "taxPaid": 400.00,
          "filingDue": "2025-06-30",
          "status": "Up-to-date"
        },
        "quarterlySummary": {
          "Q2": {
            "taxLiability": 600.00,
            "taxPaid": 450.00
          }
        },
        "annualReport": {
          "liability": 1200.00,
          "paid": 900.00,
          "carryforward": 0.00
        },
        "salesTaxReport": {
          "salesRevenue": 6500.00,
          "salesTaxCollected": 130.00,
          "salesTaxDue": 130.00
        }
      },
      "reports": {
        "financialRatios": {
          "currentRatio": 2.61,
          "profitMargin": 0.25,
          "debtRatio": 0.38
        },
        "budgetComparison": {
          "budgetedRevenue": 7000.00,
          "actualRevenue": 6500.00,
          "budgetedExpenses": 5000.00,
          "actualExpenses": 4875.50,
          "varianceRevenue": -500.00,
          "varianceExpenses": -124.50
        },
        "expensesByCategory": [
          {
            "category": "Office Supplies",
            "amount": 125.50,
            "percentage": 2.57
          },
          {
            "category": "Salaries",
            "amount": 3000.00,
            "percentage": 61.54
          },
          {
            "category": "Utilities",
            "amount": 200.00,
            "percentage": 4.10
          },
          {
            "category": "Rent",
            "amount": 1200.00,
            "percentage": 24.61
          },
          {
            "category": "Internet & Phone",
            "amount": 100.00,
            "percentage": 2.05
          },
          {
            "category": "Travel",
            "amount": 250.00,
            "percentage": 5.13
          }
        ],
        "monthlyTrends": {
          "month": "May",
          "income": 6500.00,
          "expenses": 4875.50,
          "profit": 1624.50
        }
      }
    }

  const recommendationsFromAI = async (transactions) => {
    const GEMINI_API_KEY = "AIzaSyA6uSVWMWopA9O1l5F74QeeBw0vA4bU9o4"
    const prompt = `
      You are a financial assistant AI. You will receive a JSON object containing detailed financial information for a company. The input data will include the following sections:
      1. Business Information:
        - name
        - fiscal year
        - reporting month
        - industry
      2. Revenue Sources:
        - total revenue
        - breakdown by revenue streams (if available)
      3. Expense Categories:
        - total expenses
        - breakdown by expense categories (e.g., rent, utilities, salaries, supplies)
      4. Budgeted vs. Actual:
        - budgeted revenue/expenses
        - actual revenue/expenses
      5. Balance Sheet Details:
        - assets
        - liabilities
        - equity
      6. Cash Flow Details:
        - operating activities
        - investing activities
        - financing activities
      7. Tax Data:
        - relevant tax details
      8. Financial Ratios:
        - liquidity, profitability, etc.
      
      Your task is to analyze this input and return an array of **six** structured JSON objects representing the following financial statements and reports:
      
      1. **Balance Sheet**:
        Fields:
        - date: today's date (e.g., "2025-05-01")
        - assets:
          - cash
          - accounts_receivable
          - inventory
          - equipment
          - total_assets
        - liabilities:
          - accounts_payable
          - loan_payable
          - total_liabilities
        - equity:
          - owner_equity
          - retained_earnings
          - total_equity
      
      2. **Income Statement**:
        Fields:
        - period: the reporting month in YYYY-MM format (e.g., "2025-04")
        - revenue:
          - sales
          - service_income
          - total_revenue
        - expenses:
          - rent
          - utilities
          - salaries
          - supplies
          - total_expenses
        - net_income: calculated as total revenue - total expenses
      
      3. **Cash Flow Statement**:
        Fields:
        - period: the reporting month in YYYY-MM format
        - operating_activities:
          - cash_received_from_customers
          - cash_paid_for_expenses
          - net_cash_from_operating
        - investing_activities:
          - equipment_purchase
          - asset_sale
          - net_cash_from_investing
        - financing_activities:
          - loan_received
          - owner_draw
          - net_cash_from_financing
        - net_cash_flow: sum of operating + investing + financing
      
      4. **Quarterly Tax Summary**:
        Fields:
        - quarter: e.g., "Q2"
        - tax_liability
        - tax_paid
        - tax_due: tax_liability - tax_paid
      
      5. **Annual Tax Report**:
        Fields:
        - fiscal_year
        - total_tax_liability
        - total_tax_paid
        - carryforward_amount
        - tax_status
      
      6. **Sales Tax Report**:
        Fields:
        - sales_revenue
        - sales_tax_collected
        - sales_tax_due
      
      **Rules**:
      - Use fields from the input data and map them intelligently to the specified categories.
      - Rename keys where necessary to ensure standardization.
      - Ensure realistic approximations or conversions, such as converting "App Maintenance" and "Consulting" to "service_income".
      - Ensure values match the logic and numbers from the original input.
      
      **EXTREMELY IMPORTANT**: Your response must ONLY contain the raw JSON array, starting with [ and ending with ]. Do not include any explanation, markdown formatting, or surrounding text. Just return the raw JSON array.
      
      Example Output Format:
      
      [
        {
          "balance_sheet": {
            "date": "2025-05-01",
            "assets": {
              "cash": 2000,
              "accounts_receivable": 1800,
              "inventory": 500,
              "equipment": 3000,
              "total_assets": 7300
            },
            "liabilities": {
              "accounts_payable": 800,
              "loan_payable": 2000,
              "total_liabilities": 2800
            },
            "equity": {
              "owner_equity": 3500,
              "retained_earnings": 1000,
              "total_equity": 4500
            }
          }
        },
        {
          "income_statement": {
            "period": "2025-04",
            "revenue": {
              "sales": 4500,
              "service_income": 2000,
              "total_revenue": 6500
            },
            "expenses": {
              "rent": 1200,
              "utilities": 200,
              "salaries": 3000,
              "supplies": 475.5,
              "total_expenses": 4875.5
            },
            "net_income": 1624.5
          }
        },
        {
          "cash_flow_statement": {
            "period": "2025-04",
            "operating_activities": {
              "cash_received_from_customers": 6000,
              "cash_paid_for_expenses": -4500,
              "net_cash_from_operating": 1500
            },
            "investing_activities": {
              "equipment_purchase": -500,
              "asset_sale": 0,
              "net_cash_from_investing": -500
            },
            "financing_activities": {
              "loan_received": 1000,
              "owner_draw": -250,
              "net_cash_from_financing": 750
            },
            "net_cash_flow": 1750
          }
        },
        {
          "quarterly_tax_summary": {
            "quarter": "Q2",
            "tax_liability": 1300,
            "tax_paid": 1000,
            "tax_due": 300
          }
        },
        {
          "annual_tax_report": {
            "fiscal_year": "2024",
            "total_tax_liability": 5200,
            "total_tax_paid": 5000,
            "carryforward_amount": 200,
            "tax_status": "Partially Paid"
          }
        },
        {
          "sales_tax_report": {
            "sales_revenue": 4500,
            "sales_tax_collected": 450,
            "sales_tax_due": 450
          }
        }
      ]
    `;
    
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
                parts: [{ text: prompt + "\n\n Dummy Data:\n" + JSON.stringify(transactions, null, 2) }],
              },
            ],
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Financial Statements</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialStatements.length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>All statements up to date</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Tax Reports</h3>
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{taxReports.length}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>{taxReports.filter(r => r.status === 'ready').length} ready for filing</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Analysis Reports</h3>
            <FileText className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialStatements.length}</p>
          <p className="text-sm text-purple-500 mt-2 flex items-center">
            <span>Performance insights available</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Financial Statements
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2">Report</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Income</th>
                <th className="px-4 py-2">Expenses</th>
                <th className="px-4 py-2">Profit</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr><td colSpan={7}>
                  <div className="flex flex-col items-center justify-center h-32">
                    <Loader2 className="animate-spin text-white h-6 w-6 mb-2" />
                    <span className="text-white text-sm">Analyzing with Gemini AI...</span>
                  </div>
                </td></tr>
              </tbody>
            ) : (
            <tbody className="divide-y divide-gray-800">
            {balanceSheet && balanceSheet.date && (
              <tr>
                <td className="px-4 py-3 text-sm text-gray-300">Balance Sheet</td>
                <td className="px-4 py-3 text-sm text-gray-300">{balanceSheet.date}</td>
                <td className="px-4 py-3 text-sm text-green-400">
                  {formatCurrency(balanceSheet.assets.total_assets)}
                </td>
                <td className="px-4 py-3 text-sm text-red-400">
                  {formatCurrency(balanceSheet.liabilities.total_liabilities)}
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {formatCurrency(balanceSheet.equity.total_equity)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                    Finalized
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Download size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Printer size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Share2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {incomeStatement && incomeStatement.period && (
              <tr>
                <td className="px-4 py-3 text-sm text-gray-300">Income Statement</td>
                <td className="px-4 py-3 text-sm text-gray-300">{incomeStatement.period}</td>
                <td className="px-4 py-3 text-sm text-green-400">
                  {formatCurrency(incomeStatement.revenue.total_revenue)}
                </td>
                <td className="px-4 py-3 text-sm text-red-400">
                  {formatCurrency(incomeStatement.expenses.total_expenses)}
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {formatCurrency(incomeStatement.net_income)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                    Finalized
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Download size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Printer size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Share2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {cashFlowStatement && cashFlowStatement.period && (
              <tr>
                <td className="px-4 py-3 text-sm text-gray-300">Cash Flow Statement</td>
                <td className="px-4 py-3 text-sm text-gray-300">{cashFlowStatement.period}</td>
                <td className="px-4 py-3 text-sm text-green-400">
                  {formatCurrency(cashFlowStatement.operating_activities.net_cash_from_operating)}
                </td>
                <td className="px-4 py-3 text-sm text-red-400">
                  {formatCurrency(cashFlowStatement.investing_activities.net_cash_from_investing)}
                </td>
                <td className="px-4 py-3 text-sm text-white">{formatCurrency(cashFlowStatement.net_cash_flow)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                    Finalized
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Download size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Printer size={16} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <Share2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            </tbody> )}
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Tax & Compliance Reports
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2">Report</th>
                  <th className="px-4 py-2">Period</th>
                  <th className="px-4 py-2">Tax Liability</th>
                  <th className="px-4 py-2">Tax Paid</th>
                  <th className="px-4 py-2">Tax Due </th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr><td colSpan={7}>
                    <div className="flex flex-col items-center justify-center h-32">
                      <Loader2 className="animate-spin text-white h-6 w-6 mb-2" />
                      <span className="text-white text-sm">Analyzing with Gemini AI...</span>
                    </div>
                  </td></tr>
                </tbody>
              ) : (
              <tbody className="divide-y divide-gray-800">
              {quarterlyTaxSummary && quarterlyTaxSummary.quarter && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">Quarterly Tax Summary</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{quarterlyTaxSummary.quarter}</td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {formatCurrency(quarterlyTaxSummary.tax_liability)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-400">
                    {formatCurrency(quarterlyTaxSummary.tax_paid)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {formatCurrency(quarterlyTaxSummary.tax_due)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      Finalized
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {annualTaxReport && annualTaxReport.fiscal_year && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">Annual Tax Report</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{annualTaxReport.fiscal_year}</td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {formatCurrency(annualTaxReport.total_tax_liability)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-400">
                    {formatCurrency(annualTaxReport.total_tax_paid)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {formatCurrency(annualTaxReport.carryforward_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      Finalized
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {salesTaxReport && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">Sales Tax Report</td>
                  <td className="px-4 py-3 text-sm text-gray-300">N/A</td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {formatCurrency(salesTaxReport.sales_revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-400">
                    {formatCurrency(salesTaxReport.sales_tax_collected)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {formatCurrency(salesTaxReport.sales_tax_due)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      Finalized
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              </tbody> )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
