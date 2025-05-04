/**
 * Utility for tracking positions of data in source documents
 * This helps create an audit trail linking transactions to their source documents
 */

// Store document position data in localStorage
export const storeDocumentPosition = (transactionId, documentName, extractionData) => {
  try {
    // Get existing position data
    const positionData = JSON.parse(localStorage.getItem('documentPositions') || '{}');
    
    // Add new position data
    positionData[transactionId] = {
      documentName,
      extractionData,
      timestamp: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('documentPositions', JSON.stringify(positionData));
    return true;
  } catch (error) {
    console.error('Failed to store document position:', error);
    return false;
  }
};

// Get document position data for a transaction
export const getDocumentPosition = (transactionId) => {
  try {
    const positionData = JSON.parse(localStorage.getItem('documentPositions') || '{}');
    return positionData[transactionId] || null;
  } catch (error) {
    console.error('Failed to get document position:', error);
    return null;
  }
};

// Get all document positions
export const getAllDocumentPositions = () => {
  try {
    return JSON.parse(localStorage.getItem('documentPositions') || '{}');
  } catch (error) {
    console.error('Failed to get all document positions:', error);
    return {};
  }
};

// Check if a transaction has position data
export const hasDocumentPosition = (transactionId) => {
  const positionData = JSON.parse(localStorage.getItem('documentPositions') || '{}');
  return !!positionData[transactionId];
};

// Get all transactions for a specific document
export const getTransactionsForDocument = (documentName) => {
  try {
    const positionData = JSON.parse(localStorage.getItem('documentPositions') || '{}');
    const transactionIds = [];
    
    for (const [transactionId, data] of Object.entries(positionData)) {
      if (data.documentName === documentName) {
        transactionIds.push(transactionId);
      }
    }
    
    return transactionIds;
  } catch (error) {
    console.error('Failed to get transactions for document:', error);
    return [];
  }
};
