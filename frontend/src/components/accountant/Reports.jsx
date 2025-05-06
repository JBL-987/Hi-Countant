import React, { useState, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Download,
  FileText,
  BarChart3,
  Receipt,
  Eye,
  Trash2,
  Sparkles,
  MoveHorizontal
} from "lucide-react";
import FilePreview from "./FilePreview";

const Reports = ({
  transactions,
  files,
  handleFileDownload,
  handleFileDelete,
}) => {
  // Ensure transactions and files are always arrays
  const normalizedTransactions = Array.isArray(transactions) ? transactions : [];
  const normalizedFiles = Array.isArray(files) ? files : [];

  // State for generated reports
  const [generatedReports, setGeneratedReports] = useState({
    balanceSheet: null,
    incomeStatement: null,
    cashFlowStatement: null,
    quarterlyTaxSummary: null,
    annualTaxReport: null,
    salesTaxReport: null
  });

  const [previewFile, setPreviewFile] = useState(null);

  // Folder structure state
  const [folderStructure, setFolderStructure] = useState({
    Financial_Reports: {
      expanded: false,
      description: "Generated financial reports",
      files: [],
    },
    Tax_Reports: {
      expanded: false,
      description: "Generated tax compliance reports",
      files: [],
    },
    Uploaded_Files: {
      expanded: true,
      description: "User uploaded documents",
      files: normalizedFiles,
    },
  });

  // Update files when prop changes
  useEffect(() => {
    setFolderStructure(prev => ({
      ...prev,
      Uploaded_Files: {
        ...prev.Uploaded_Files,
        files: normalizedFiles
      }
    }));
  }, [files]);

  // Helper functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatLabel = (label) => {
    return label.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Process transactions to generate financial data
  const processFinancialData = () => {
    const income = normalizedTransactions.filter(t => t.transactionType === 'income');
    const expenses = normalizedTransactions.filter(t => t.transactionType === 'expense');
    const taxDeductible = normalizedTransactions.filter(t => t.taxDeductible);

    // Calculate totals
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    const taxDeductibleAmount = taxDeductible.reduce((sum, t) => sum + t.amount, 0);

    return {
      balanceSheet: {
        assets: {
          cash: netIncome,
          accountsReceivable: 0,
          inventory: 0,
          totalCurrentAssets: netIncome,
          property: 0,
          equipment: 0,
          totalFixedAssets: 0,
          totalAssets: netIncome
        },
        liabilities: {
          accountsPayable: 0,
          shortTermDebt: 0,
          totalCurrentLiabilities: 0,
          longTermDebt: 0,
          totalLiabilities: 0
        },
        equity: {
          retainedEarnings: netIncome,
          totalEquity: netIncome
        }
      },
      incomeStatement: {
        revenue: {
          sales: totalIncome,
          otherIncome: 0,
          totalRevenue: totalIncome
        },
        expenses: {
          cogs: 0,
          salaries: expenses.filter(e => e.category === 'salary').reduce((sum, t) => sum + t.amount, 0),
          rent: expenses.filter(e => e.category === 'rent').reduce((sum, t) => sum + t.amount, 0),
          utilities: expenses.filter(e => e.category === 'utilities').reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: totalExpenses
        },
        netIncome: netIncome
      },
      cashFlowStatement: {
        operatingActivities: {
          netIncome: netIncome,
          adjustments: 0,
          changesInWorkingCapital: 0,
          netCashFromOperating: netIncome
        },
        investingActivities: {
          capitalExpenditures: 0,
          investments: 0,
          netCashFromInvesting: 0
        },
        financingActivities: {
          debtIssued: 0,
          equityIssued: 0,
          netCashFromFinancing: 0
        },
        netCashIncrease: netIncome
      },
      taxReports: {
        quarterlyTax: {
          taxableIncome: netIncome,
          taxRate: 20,
          taxDue: netIncome * 0.2,
          paymentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        annualTax: {
          taxableIncome: netIncome,
          taxRate: 20,
          taxDue: netIncome * 0.2,
          deductions: taxDeductibleAmount,
          credits: 0
        },
        salesTax: {
          taxableSales: totalIncome,
          taxRate: 10,
          salesTaxDue: totalIncome * 0.1
        }
      }
    };
  };

  // Generate PDF reports with dynamic content
  const generateBalanceSheetPDF = (doc, data) => {
    const tableData = [
      ["Assets", ""],
      ["  Current Assets", ""],
      ...Object.entries(data.assets || {}).filter(([key]) => !key.startsWith('total') && key !== 'property' && key !== 'equipment')
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["  Total Current Assets", formatCurrency(data.assets?.totalCurrentAssets || 0)],
      ["  Fixed Assets", ""],
      ["    Property", formatCurrency(data.assets?.property || 0)],
      ["    Equipment", formatCurrency(data.assets?.equipment || 0)],
      ["  Total Fixed Assets", formatCurrency(data.assets?.totalFixedAssets || 0)],
      ["Total Assets", formatCurrency(data.assets?.totalAssets || 0)],
      ["", ""],
      ["Liabilities", ""],
      ["  Current Liabilities", ""],
      ...Object.entries(data.liabilities || {}).filter(([key]) => !key.startsWith('total'))
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["  Total Current Liabilities", formatCurrency(data.liabilities?.totalCurrentLiabilities || 0)],
      ["  Long-term Liabilities", ""],
      ["    Long-term Debt", formatCurrency(data.liabilities?.longTermDebt || 0)],
      ["Total Liabilities", formatCurrency(data.liabilities?.totalLiabilities || 0)],
      ["", ""],
      ["Equity", ""],
      ["    Retained Earnings", formatCurrency(data.equity?.retainedEarnings || 0)],
      ["Total Equity", formatCurrency(data.equity?.totalEquity || 0)],
      ["", ""],
      ["Liabilities + Equity", formatCurrency((data.liabilities?.totalLiabilities || 0) + (data.equity?.totalEquity || 0))]
    ];

    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 120 },
        1: { cellWidth: 'auto', halign: 'right' }
      }
    });
  };

  const generateIncomeStatementPDF = (doc, data) => {
    const tableData = [
      ["Revenue", ""],
      ...Object.entries(data.revenue || {}).filter(([key]) => key !== 'totalRevenue')
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["Total Revenue", formatCurrency(data.revenue?.totalRevenue || 0)],
      ["", ""],
      ["Expenses", ""],
      ...Object.entries(data.expenses || {}).filter(([key]) => key !== 'totalExpenses')
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["Total Expenses", formatCurrency(data.expenses?.totalExpenses || 0)],
      ["", ""],
      ["Net Income", formatCurrency(data.netIncome || 0)]
    ];

    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 }
    });
  };

  const generateCashFlowPDF = (doc, data) => {
    const tableData = [
      ["Operating Activities", ""],
      ...Object.entries(data.operatingActivities || {})
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["", ""],
      ["Investing Activities", ""],
      ...Object.entries(data.investingActivities || {})
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["", ""],
      ["Financing Activities", ""],
      ...Object.entries(data.financingActivities || {})
        .map(([key, value]) => [`    ${formatLabel(key)}`, formatCurrency(value)]),
      ["", ""],
      ["Net Cash Flow", formatCurrency(data.netCashIncrease || 0)]
    ];

    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 }
    });
  };

  const generateTaxReportPDF = (doc, data, type) => {
    let tableData = [];
    let title = "";

    if (type === 'quarterly') {
      title = "Quarterly Tax Summary";
      tableData = [
        ["Quarter", "Q1"],
        ["Taxable Income", formatCurrency(data.taxableIncome)],
        ["Tax Rate", `${data.taxRate}%`],
        ["Tax Due", formatCurrency(data.taxDue)],
        ["Payment Deadline", data.paymentDeadline]
      ];
    } else if (type === 'annual') {
      title = "Annual Tax Report";
      tableData = [
        ["Year", new Date().getFullYear()],
        ["Taxable Income", formatCurrency(data.taxableIncome)],
        ["Tax Rate", `${data.taxRate}%`],
        ["Tax Due", formatCurrency(data.taxDue)],
        ["Deductions", formatCurrency(data.deductions)],
        ["Credits", formatCurrency(data.credits)]
      ];
    } else if (type === 'sales') {
      title = "Sales Tax Report";
      tableData = [
        ["Period", "Current Period"],
        ["Taxable Sales", formatCurrency(data.taxableSales)],
        ["Tax Rate", `${data.taxRate}%`],
        ["Sales Tax Due", formatCurrency(data.salesTaxDue)]
      ];
    }

    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 }
    });

    return title;
  };

  // Main report generation function
  const generateReport = (reportType) => {
    const financialData = processFinancialData();
    const doc = new jsPDF();
    
    // Common header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 153);
    doc.text("Financial Report", 105, 15, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);

    let reportName = "";
    
    switch(reportType) {
      case 'balanceSheet':
        reportName = "Balance Sheet";
        doc.text(reportName, 105, 25, { align: "center" });
        generateBalanceSheetPDF(doc, financialData.balanceSheet);
        break;
      case 'incomeStatement':
        reportName = "Income Statement";
        doc.text(reportName, 105, 25, { align: "center" });
        generateIncomeStatementPDF(doc, financialData.incomeStatement);
        break;
      case 'cashFlowStatement':
        reportName = "Cash Flow Statement";
        doc.text(reportName, 105, 25, { align: "center" });
        generateCashFlowPDF(doc, financialData.cashFlowStatement);
        break;
      case 'quarterlyTaxSummary':
        reportName = generateTaxReportPDF(doc, financialData.taxReports.quarterlyTax, 'quarterly');
        doc.text(reportName, 105, 25, { align: "center" });
        break;
      case 'annualTaxReport':
        reportName = generateTaxReportPDF(doc, financialData.taxReports.annualTax, 'annual');
        doc.text(reportName, 105, 25, { align: "center" });
        break;
      case 'salesTaxReport':
        reportName = generateTaxReportPDF(doc, financialData.taxReports.salesTax, 'sales');
        doc.text(reportName, 105, 25, { align: "center" });
        break;
      default:
        doc.text("Financial Report", 105, 25, { align: "center" });
        doc.text("No data available for this report", 15, 40);
    }

    // Common footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Save the PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Update generated reports state
    setGeneratedReports(prev => ({
      ...prev,
      [reportType]: {
        name: `${reportName}.pdf`,
        url: pdfUrl,
        blob: pdfBlob,
        lastGenerated: new Date().toISOString()
      }
    }));

    // Add to appropriate folder
    const folder = reportType.includes('Tax') ? 'Tax_Reports' : 'Financial_Reports';
    setFolderStructure(prev => {
      const existingIndex = prev[folder].files.findIndex(f => f.name === `${reportName}.pdf`);
      
      if (existingIndex >= 0) {
        // Update existing
        const updatedFiles = [...prev[folder].files];
        updatedFiles[existingIndex] = {
          name: `${reportName}.pdf`,
          url: pdfUrl,
          generated: true
        };
        
        return {
          ...prev,
          [folder]: {
            ...prev[folder],
            files: updatedFiles
          }
        };
      } else {
        // Add new
        return {
          ...prev,
          [folder]: {
            ...prev[folder],
            files: [
              ...prev[folder].files,
              {
                name: `${reportName}.pdf`,
                url: pdfUrl,
                blob: pdfBlob,  // Tambahkan blob
                type: 'pdf',    // Tambahkan type
                generated: true // Flag sebagai generated
              }
            ]
          }
        };
      }
    });

    return pdfBlob;
  };

  const handleGeneratedFileDelete = (fileName) => {
  setFolderStructure(prev => {
    const updated = {...prev};
    // Cari di semua folder
    Object.keys(updated).forEach(folder => {
      updated[folder].files = updated[folder].files.filter(f => f.name !== fileName);
    });
    return updated;
  });
  
  // Juga hapus dari generatedReports jika ada
  setGeneratedReports(prev => {
    const reportType = Object.keys(prev).find(key => 
      prev[key]?.name === fileName
    );
    if (reportType) {
      return {...prev, [reportType]: null};
    }
    return prev;
  });
};

const handleFileAction = (file, action) => {
  if (file.generated) {
    if (action === 'delete') {
      handleGeneratedFileDelete(file.name);
    } else if (action === 'download') {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  } else {
    if (action === 'delete') {
      handleFileDelete(file.name);
    } else if (action === 'download') {
      handleFileDownload(file.name);
    }
  }
};

  // File preview handler
  const openFilePreview = async (file) => {
  if (file.generated) {
    setPreviewFile({
      name: file.name,
      url: file.url,
      blob: file.blob,  // Pastikan blob tersedia
      type: 'pdf'       // Tipe pasti PDF untuk generated files
    });
  } else {
    try {
      setPreviewFile({ name: file.name, loading: true });
      const fileBlob = await handleFileDownload(file.name, true);
      setPreviewFile({
        name: file.name,
        blob: fileBlob,
        type: file.name.split('.').pop().toLowerCase()
      });
    } catch (error) {
      console.error("Error previewing file:", error);
      setPreviewFile({
        name: file.name,
        isPreviewPlaceholder: true,
        type: file.name.split('.').pop().toLowerCase()
      });
    }
  }
};

  const closeFilePreview = () => {
    setPreviewFile(null);
  };

  // Render UI
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Financial Reports</h1>
      </div>

      {/* Report Generation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => generateReport('balanceSheet')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <FileText size={24} className="mb-2" />
          <span>Balance Sheet</span>
        </button>
        <button
          onClick={() => generateReport('incomeStatement')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <BarChart3 size={24} className="mb-2" />
          <span>Income Statement</span>
        </button>
        <button
          onClick={() => generateReport('cashFlowStatement')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <MoveHorizontal size={24} className="mb-2" />
          <span>Cash Flow</span>
        </button>
        <button
          onClick={() => generateReport('quarterlyTaxSummary')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <Receipt size={24} className="mb-2" />
          <span>Quarterly Tax</span>
        </button>
        <button
          onClick={() => generateReport('annualTaxReport')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <Receipt size={24} className="mb-2" />
          <span>Annual Tax</span>
        </button>
        <button
          onClick={() => generateReport('salesTaxReport')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center"
        >
          <Receipt size={24} className="mb-2" />
          <span>Sales Tax</span>
        </button>
      </div>

      {/* File Explorer */}
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">File Explorer</h2>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {Object.entries(folderStructure).map(([folderName, folder]) => (
            <div key={folderName} className="border-b border-gray-700 last:border-0">
              <div
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => setFolderStructure(prev => ({
                  ...prev,
                  [folderName]: {
                    ...prev[folderName],
                    expanded: !prev[folderName].expanded
                  }
                }))}
              >
                <div className="flex items-center">
                  {folder.expanded ? (
                    <ChevronDown size={16} className="mr-2" />
                  ) : (
                    <ChevronRight size={16} className="mr-2" />
                  )}
                  <Folder size={16} className="mr-2" />
                  <span className="font-medium">
                    {folderName.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({folder.files.length} files)
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {folder.description}
                </span>
              </div>

              {folder.expanded && (
                <div className="bg-gray-800/50 pl-8">
                  {folder.files.length > 0 ? (
                    folder.files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          {file.name.endsWith('.pdf') ? (
                            <FileText size={16} className="mr-2" />
                          ) : (
                            <File size={16} className="mr-2" />
                          )}
                          <span>{file.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFilePreview(file);
                            }}
                            className="text-gray-400 hover:text-blue-400"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                           onClick={(e) => {
                              e.stopPropagation();
                              handleFileAction(file, 'download');
                            }}
                            className="text-gray-400 hover:text-green-400"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                           onClick={(e) => {
                              e.stopPropagation();
                              handleFileAction(file, 'delete');
                            }}
                            className="text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      This folder is empty
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={closeFilePreview}
          onDownload={() => {
            if (previewFile.url) {
              const link = document.createElement('a');
              link.href = previewFile.url;
              link.download = previewFile.name;
              link.click();
            } else {
              handleFileDownload(previewFile.name);
            }
          }}
        />
      )}
    </div>
  );
};

export default Reports;