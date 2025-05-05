import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, Share2, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = ({ transactions }) => {
  // Financial statements state
  const [financialStatements, setFinancialStatements] = useState([]);
  const [taxReports, setTaxReports] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState({});
  const [incomeStatement, setIncomeStatement] = useState({});
  const [cashFlowStatement, setCashFlowStatement] = useState({});
  const [quarterlyTaxSummary, setQuarterlyTaxSummary] = useState({});
  const [annualTaxReport, setAnnualTaxReport] = useState({});
  const [salesTaxReport, setSalesTaxReport] = useState({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [logTrail, setLogTrail] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showLogTrail, setShowLogTrail] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Ref to track if reports have been generated
  const reportsGeneratedRef = useRef(false);
  
  // Check localStorage for cached reports
  useEffect(() => {
    const cachedReports = localStorage.getItem('financialReports');
    if (cachedReports) {
      try {
        const parsedReports = JSON.parse(cachedReports);
        setBalanceSheet(parsedReports.balanceSheet || {});
        setIncomeStatement(parsedReports.incomeStatement || {});
        setCashFlowStatement(parsedReports.cashFlowStatement || {});
        setQuarterlyTaxSummary(parsedReports.quarterlyTaxSummary || {});
        setAnnualTaxReport(parsedReports.annualTaxReport || {});
        setSalesTaxReport(parsedReports.salesTaxReport || {});
        
        setFinancialStatements([
          parsedReports.balanceSheet,
          parsedReports.incomeStatement,
          parsedReports.cashFlowStatement,
        ].filter(Boolean));
        
        setTaxReports([
          parsedReports.quarterlyTaxSummary,
          parsedReports.annualTaxReport,
          parsedReports.salesTaxReport
        ].filter(Boolean));
        
        reportsGeneratedRef.current = true;
      } catch (error) {
        console.error("Error parsing cached reports:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Only generate reports if they haven't been generated yet and we have transactions
    if (transactions && transactions.length > 0 && !reportsGeneratedRef.current) {
      const fetchFinancialData = async () => {
        setLoading(true);

        // Add to log trail
        const startTimestamp = new Date().toISOString();
        const startLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: startTimestamp,
          action: 'Started Report Generation',
          details: 'Analyzing financial data with Gemini AI',
          status: 'pending'
        };

        setLogTrail(prev => [startLogEntry, ...prev]);

        try {
          const statements = await recommendationsFromAI(transactions);
          if (statements && statements.length === 6) {
            const [ balanceData, incomeData, cashFlowData, quarterlyTaxData, annualTaxData, salesTaxData ] = statements;

            const balanceSheetData = balanceData?.balance_sheet || {};
            const incomeStatementData = incomeData?.income_statement || {};
            const cashFlowStatementData = cashFlowData?.cash_flow_statement || {};
            const quarterlyTaxSummaryData = quarterlyTaxData?.quarterly_tax_summary || {};
            const annualTaxReportData = annualTaxData?.annual_tax_report || {};
            const salesTaxReportData = salesTaxData?.sales_tax_report || {};

            setBalanceSheet(balanceSheetData);
            setIncomeStatement(incomeStatementData);
            setCashFlowStatement(cashFlowStatementData);
            setQuarterlyTaxSummary(quarterlyTaxSummaryData);
            setAnnualTaxReport(annualTaxReportData);
            setSalesTaxReport(salesTaxReportData);

            setFinancialStatements([
              balanceSheetData,
              incomeStatementData,
              cashFlowStatementData,
            ].filter(Boolean));

            setTaxReports([
              quarterlyTaxSummaryData,
              annualTaxReportData,
              salesTaxReportData
            ].filter(Boolean));

            // Mark reports as generated
            reportsGeneratedRef.current = true;

            // Cache the reports in localStorage
            localStorage.setItem('financialReports', JSON.stringify({
              balanceSheet: balanceSheetData,
              incomeStatement: incomeStatementData,
              cashFlowStatement: cashFlowStatementData,
              quarterlyTaxSummary: quarterlyTaxSummaryData,
              annualTaxReport: annualTaxReportData,
              salesTaxReport: salesTaxReportData
            }));

            // Add to log trail
            const timestamp = new Date().toISOString();
            const newLogEntry = {
              id: `log-${Date.now()}`,
              timestamp,
              action: 'Generated Reports',
              details: 'Financial statements and tax reports generated successfully',
              status: 'success'
            };

            setLogTrail(prev => [newLogEntry, ...prev.filter(entry => entry.id !== startLogEntry.id)]);
            showNotification('Reports generated successfully!', 'success');
          }
        } catch (error) {
          const timestamp = new Date().toISOString();
          const newLogEntry = {
            id: `log-${Date.now()}`,
            timestamp,
            action: 'Report Generation Failed',
            details: error.message || 'Failed to generate reports',
            status: 'error'
          };

          setLogTrail(prev => [newLogEntry, ...prev.filter(entry => entry.id !== startLogEntry.id)]);
          showNotification('Failed to generate reports', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchFinancialData();
    }
  }, [transactions]);


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
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Get report name from report object
  const getReportName = (report) => {
    if (report === balanceSheet) return 'Balance Sheet';
    if (report === incomeStatement) return 'Income Statement';
    if (report === cashFlowStatement) return 'Cash Flow Statement';
    if (report === quarterlyTaxSummary) return 'Quarterly Tax Summary';
    if (report === annualTaxReport) return 'Annual Tax Report';
    if (report === salesTaxReport) return 'Sales Tax Report';
    return 'Report';
  };

  // Handle view report
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  // Download report as PDF
  const handleDownloadReport = (report) => {
    const doc = new jsPDF();
    const reportName = getReportName(report);

    // Add to log trail
    const timestamp = new Date().toISOString();
    const newLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      action: 'Downloaded Report',
      details: `Downloaded ${reportName} as PDF`,
      status: 'success'
    };

    setLogTrail(prev => [newLogEntry, ...prev]);
    showNotification(`${reportName} downloaded successfully`, 'success');

    // Generate PDF based on report type
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 153);
    doc.text("Hi! Countant", 105, 15, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(reportName, 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });

    // Add report details based on type
    if (report === balanceSheet) {
      generateBalanceSheetPDF(doc);
    } else if (report === incomeStatement) {
      generateIncomeStatementPDF(doc);
    } else if (report === cashFlowStatement) {
      generateCashFlowPDF(doc);
    } else if (report === quarterlyTaxSummary) {
      generateQuarterlyTaxPDF(doc);
    } else if (report === annualTaxReport) {
      generateAnnualTaxPDF(doc);
    } else if (report === salesTaxReport) {
      generateSalesTaxPDF(doc);
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Generated by Hi! Countant - AI Accountant Platform",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
  };

  // Tambahkan fungsi untuk menghasilkan PDF komprehensif
  const handleGenerateComprehensivePDF = () => {
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 153);
    doc.text("Hi! Countant - Financial Reports", 105, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, {
      align: "center",
    });

    // Basic transaction info
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 35, 182, 10, "F");
    doc.setFont(undefined, "bold");
    doc.text("Financial Statements", 15, 42);
    doc.setFont(undefined, "normal");
    
    let finalY = 46;
    
    // Financial Statements Section
    if (financialStatements.length > 0) {
      // Balance Sheet
      if (balanceSheet && Object.keys(balanceSheet).length > 0) {
        const balanceSheetData = [
          ["Balance Sheet", ""],
          ["Date", balanceSheet.date || new Date().toISOString().split('T')[0]],
          ["", ""],
          ["Assets", ""],
        ];
        
        // Add assets
        Object.entries(balanceSheet.assets || {}).forEach(([key, value]) => {
          if (key !== 'total_assets') {
            balanceSheetData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        balanceSheetData.push(["Total Assets", formatCurrency(balanceSheet.assets?.total_assets || 0)]);
        
        balanceSheetData.push(["", ""]);
        balanceSheetData.push(["Liabilities", ""]);
        
        // Add liabilities
        Object.entries(balanceSheet.liabilities || {}).forEach(([key, value]) => {
          if (key !== 'total_liabilities') {
            balanceSheetData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        balanceSheetData.push(["Total Liabilities", formatCurrency(balanceSheet.liabilities?.total_liabilities || 0)]);
        
        balanceSheetData.push(["", ""]);
        balanceSheetData.push(["Equity", ""]);
        
        // Add equity
        Object.entries(balanceSheet.equity || {}).forEach(([key, value]) => {
          if (key !== 'total_equity') {
            balanceSheetData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        balanceSheetData.push(["Total Equity", formatCurrency(balanceSheet.equity?.total_equity || 0)]);
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY,
          head: [],
          body: balanceSheetData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
      
      // Get the final Y position from the previous table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 100;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      
      // Income Statement
      if (incomeStatement && Object.keys(incomeStatement).length > 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, finalY, 182, 10, "F");
        doc.setFont(undefined, "bold");
        doc.text("Income Statement", 15, finalY + 7);
        doc.setFont(undefined, "normal");
        
        const incomeStatementData = [
          ["Period", incomeStatement.period || new Date().toISOString().split('T')[0].substring(0, 7)],
          ["", ""],
          ["Revenue", ""],
        ];
        
        // Add revenue
        Object.entries(incomeStatement.revenue || {}).forEach(([key, value]) => {
          if (key !== 'total_revenue') {
            incomeStatementData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        incomeStatementData.push(["Total Revenue", formatCurrency(incomeStatement.revenue?.total_revenue || 0)]);
        
        incomeStatementData.push(["", ""]);
        incomeStatementData.push(["Expenses", ""]);
        
        // Add expenses
        Object.entries(incomeStatement.expenses || {}).forEach(([key, value]) => {
          if (key !== 'total_expenses') {
            incomeStatementData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        incomeStatementData.push(["Total Expenses", formatCurrency(incomeStatement.expenses?.total_expenses || 0)]);
        
        incomeStatementData.push(["", ""]);
        incomeStatementData.push(["Net Income", formatCurrency(incomeStatement.net_income || 0)]);
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY + 12,
          head: [],
          body: incomeStatementData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
      
      // Get the final Y position from the previous table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : finalY + 100;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      
      // Cash Flow Statement
      if (cashFlowStatement && Object.keys(cashFlowStatement).length > 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, finalY, 182, 10, "F");
        doc.setFont(undefined, "bold");
        doc.text("Cash Flow Statement", 15, finalY + 7);
        doc.setFont(undefined, "normal");
        
        const cashFlowData = [
          ["Period", cashFlowStatement.period || new Date().toISOString().split('T')[0].substring(0, 7)],
          ["", ""],
          ["Operating Activities", ""],
        ];
        
        // Add operating activities
        Object.entries(cashFlowStatement.operating_activities || {}).forEach(([key, value]) => {
          if (key !== 'net_cash_from_operating') {
            cashFlowData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        cashFlowData.push(["Net Cash from Operating", formatCurrency(cashFlowStatement.operating_activities?.net_cash_from_operating || 0)]);
        
        cashFlowData.push(["", ""]);
        cashFlowData.push(["Investing Activities", ""]);
        
        // Add investing activities
        Object.entries(cashFlowStatement.investing_activities || {}).forEach(([key, value]) => {
          if (key !== 'net_cash_from_investing') {
            cashFlowData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        cashFlowData.push(["Net Cash from Investing", formatCurrency(cashFlowStatement.investing_activities?.net_cash_from_investing || 0)]);
        
        cashFlowData.push(["", ""]);
        cashFlowData.push(["Financing Activities", ""]);
        
        // Add financing activities
        Object.entries(cashFlowStatement.financing_activities || {}).forEach(([key, value]) => {
          if (key !== 'net_cash_from_financing') {
            cashFlowData.push([`  ${formatLabel(key)}`, formatCurrency(value)]);
          }
        });
        cashFlowData.push(["Net Cash from Financing", formatCurrency(cashFlowStatement.financing_activities?.net_cash_from_financing || 0)]);
        
        cashFlowData.push(["", ""]);
        cashFlowData.push(["Net Cash Flow", formatCurrency(cashFlowStatement.net_cash_flow || 0)]);
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY + 12,
          head: [],
          body: cashFlowData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
    }
    
    // Add a new page for Tax Reports
    doc.addPage();
    
    // Tax Reports Section
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 15, 182, 10, "F");
    doc.setFont(undefined, "bold");
    doc.text("Tax & Compliance Reports", 15, 22);
    doc.setFont(undefined, "normal");
    
    finalY = 30;
    
    if (taxReports.length > 0) {
      // Quarterly Tax Summary
      if (quarterlyTaxSummary && Object.keys(quarterlyTaxSummary).length > 0) {
        const quarterlyData = [
          ["Quarterly Tax Summary", ""],
          ["Quarter", quarterlyTaxSummary.quarter || "Current"],
          ["Tax Liability", formatCurrency(quarterlyTaxSummary.tax_liability || 0)],
          ["Tax Paid", formatCurrency(quarterlyTaxSummary.tax_paid || 0)],
          ["Tax Due", formatCurrency(quarterlyTaxSummary.tax_due || 0)],
        ];
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY,
          head: [],
          body: quarterlyData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
      
      // Get the final Y position from the previous table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : finalY + 100;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      
      // Annual Tax Report
      if (annualTaxReport && Object.keys(annualTaxReport).length > 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, finalY, 182, 10, "F");
        doc.setFont(undefined, "bold");
        doc.text("Annual Tax Report", 15, finalY + 7);
        doc.setFont(undefined, "normal");
        
        const annualData = [
          ["Fiscal Year", annualTaxReport.fiscal_year || new Date().getFullYear()],
          ["Total Tax Liability", formatCurrency(annualTaxReport.total_tax_liability || 0)],
          ["Total Tax Paid", formatCurrency(annualTaxReport.total_tax_paid || 0)],
          ["Carryforward Amount", formatCurrency(annualTaxReport.carryforward_amount || 0)],
        ];
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY + 12,
          head: [],
          body: annualData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
      
      // Get the final Y position from the previous table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : finalY + 100;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      
      // Sales Tax Report
      if (salesTaxReport && Object.keys(salesTaxReport).length > 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, finalY, 182, 10, "F");
        doc.setFont(undefined, "bold");
        doc.text("Sales Tax Report", 15, finalY + 7);
        doc.setFont(undefined, "normal");
        
        const salesTaxData = [
          ["Sales Revenue", formatCurrency(salesTaxReport.sales_revenue || 0)],
          ["Sales Tax Collected", formatCurrency(salesTaxReport.sales_tax_collected || 0)],
          ["Sales Tax Due", formatCurrency(salesTaxReport.sales_tax_due || 0)],
        ];
        
        // Use autoTable with the doc as first parameter
        autoTable(doc, {
          startY: finalY + 12,
          head: [],
          body: salesTaxData,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' },
          },
          margin: { left: 15, right: 15 },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Generated by Hi! Countant - AI Accountant Platform",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    // Save the PDF
    doc.save("Hi_Countant_Financial_Reports.pdf");
    
    // Add to log trail
    const timestamp = new Date().toISOString();
    const newLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      action: 'Downloaded Comprehensive Report',
      details: 'All financial statements and tax reports downloaded as PDF',
      status: 'success'
    };
    
    setLogTrail(prev => [newLogEntry, ...prev]);
    showNotification('Comprehensive report downloaded successfully', 'success');
  };

  // Fungsi helper untuk kapitalisasi
  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleGenerateComprehensivePDF}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
          >
            <Download size={16} />
            <span>Download All Reports</span>
          </button>
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
                    <Loader className="animate-spin text-white h-6 w-6 mb-2" />
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
                      <Loader className="animate-spin text-white h-6 w-6 mb-2" />
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
                      <button 
                        onClick={() => handleDownloadReport(quarterlyTaxSummary)}
                        className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                      >
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
                      <button 
                        onClick={() => handleDownloadReport(annualTaxReport)}
                        className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                      >
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
                      <button 
                        onClick={() => handleDownloadReport(salesTaxReport)}
                        className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                      >
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
