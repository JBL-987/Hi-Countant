import { getAllDocumentPositions } from './documentPositionTracker';

/**
 * Mendapatkan semua transaksi yang terkait dengan dokumen
 * @param {string} documentName - Nama dokumen (opsional)
 * @returns {Array} - Array transaksi
 */
export const getTransactionsForDocument = async (documentName = null) => {
  try {
    console.log("Getting transactions for document:", documentName);
    
    // Dapatkan semua transaksi dari localStorage
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Jika documentName tidak disediakan, kembalikan semua transaksi
    if (!documentName) {
      return allTransactions;
    }
    
    // Dapatkan posisi dokumen
    const positionData = getAllDocumentPositions();
    const transactionIds = [];
    
    // Cari transaksi yang terkait dengan dokumen
    for (const [transactionId, data] of Object.entries(positionData)) {
      if (data.documentName === documentName) {
        transactionIds.push(transactionId);
      }
    }
    
    // Filter transaksi berdasarkan ID
    const documentTransactions = allTransactions.filter(transaction => 
      transactionIds.includes(transaction.id)
    );
    
    console.log(`Found ${documentTransactions.length} transactions for document ${documentName}`);
    return documentTransactions;
  } catch (error) {
    console.error("Error getting transactions for document:", error);
    return [];
  }
};
