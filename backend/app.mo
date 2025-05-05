import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:map/Map";
import { phash; thash } "mo:map/Map";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Float "mo:base/Float";
import Error "mo:base/Error";

persistent actor Filevault {

  // Define a data type for a file's chunks.
  type FileChunk = {
    chunk : Blob;
    index : Nat;
  };

  // Define a data type for a file's data.
  type File = {
    name : Text;
    chunks : [FileChunk];
    totalSize : Nat;
    fileType : Text;
  };

  // Define a data type for a transaction.
  type Transaction = {
    id : Text;
    transactionType : Text;
    amount : Float;
    date : Text;
    description : Text;
    category : ?Text;
    paymentMethod : ?Text;
    reference : ?Text;
    taxDeductible : Bool;
    sourceFile : ?Text;
    timestamp : Text;
  };

  // Define a data type for storing files associated with a user principal.
  type UserFiles = HashMap.Map<Text, File>;

  // Define a data type for storing transactions associated with a user principal.
  type UserTransactions = [Transaction];

  // Define error types
  type Error = {
    #FileNotFound;
    #InvalidInput;
    #Unauthorized;
    #TransactionNotFound;
  };

  // HashMap to store the user data - now with stable storage
  private stable var stableFiles : [(Principal, [(Text, File)])] = [];
  private var files = HashMap.new<Principal, UserFiles>();

  // HashMap to store user transactions - using 'stable' to persist across upgrades
  private stable var stableTransactions : [(Principal, [Transaction])] = [];
  private var transactions = HashMap.new<Principal, UserTransactions>();

  // System functions for persistence
  system func preupgrade() {
    // Convert files HashMap to stable storage
    stableFiles := [];
    for ((principal, userFiles) in HashMap.entries(files)) {
      var userFileEntries : [(Text, File)] = [];
      for ((fileName, file) in HashMap.entries(userFiles)) {
        userFileEntries := Array.append(userFileEntries, [(fileName, file)]);
      };
      stableFiles := Array.append(stableFiles, [(principal, userFileEntries)]);
    };

    // Convert transactions HashMap to stable storage
    stableTransactions := [];
    for ((principal, txs) in HashMap.entries(transactions)) {
      stableTransactions := Array.append(stableTransactions, [(principal, txs)]);
    };
  };

  system func postupgrade() {
    // Restore files from stable storage
    for ((principal, userFileEntries) in stableFiles.vals()) {
      let userFiles = HashMap.new<Text, File>();
      for ((fileName, file) in userFileEntries.vals()) {
        ignore HashMap.put(userFiles, thash, fileName, file);
      };
      ignore HashMap.put(files, phash, principal, userFiles);
    };
    stableFiles := [];

    // Restore transactions from stable storage
    for ((principal, txs) in stableTransactions.vals()) {
      ignore HashMap.put(transactions, phash, principal, txs);
    };
  };

  // Return files associated with a user's principal.
  private func getUserFiles(user : Principal) : UserFiles {
    switch (HashMap.get(files, phash, user)) {
      case null {
        let newFileMap = HashMap.new<Text, File>();
        let _ = HashMap.put(files, phash, user, newFileMap);
        newFileMap;
      };
      case (?existingFiles) existingFiles;
    };
  };

  // Check if a file name already exists for the user.
  public shared (msg) func checkFileExists(name : Text) : async Bool {
    Option.isSome(HashMap.get(getUserFiles(msg.caller), thash, name));
  };

  // Upload a file in chunks.
  public shared (msg) func uploadFileChunk(name : Text, chunk : Blob, index : Nat, fileType : Text) : async () {
    // Validate input
    if (Text.size(name) == 0) {
      throw Error.reject("File name cannot be empty");
    };
    
    if (chunk.size() == 0) {
      throw Error.reject("Chunk cannot be empty");
    };

    let userFiles = getUserFiles(msg.caller);
    let fileChunk = { chunk = chunk; index = index };

    switch (HashMap.get(userFiles, thash, name)) {
      case null {
        let _ = HashMap.put(userFiles, thash, name, { name = name; chunks = [fileChunk]; totalSize = chunk.size(); fileType = fileType });
      };
      case (?existingFile) {
        let updatedChunks = Array.append(existingFile.chunks, [fileChunk]);
        let _ = HashMap.put(
          userFiles,
          thash,
          name,
          {
            name = name;
            chunks = updatedChunks;
            totalSize = existingFile.totalSize + chunk.size();
            fileType = fileType;
          }
        );
      };
    };
  };

  // Return list of files for a user.
  public shared (msg) func getFiles() : async [{ name : Text; size : Nat; fileType : Text }] {
    Iter.toArray(
      Iter.map(
        HashMap.vals(getUserFiles(msg.caller)),
        func(file : File) : { name : Text; size : Nat; fileType : Text } {
          {
            name = file.name;
            size = file.totalSize;
            fileType = file.fileType;
          };
        }
      )
    );
  };

  // Return total chunks for a file
  public shared (msg) func getTotalChunks(name : Text) : async Nat {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null 0;
      case (?file) file.chunks.size();
    };
  };

  // Return specific chunk for a file.
  public shared (msg) func getFileChunk(name : Text, index : Nat) : async ?Blob {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null;
      case (?file) {
        switch (Array.find(file.chunks, func(chunk : FileChunk) : Bool { chunk.index == index })) {
          case null null;
          case (?foundChunk) ?foundChunk.chunk;
        };
      };
    };
  };

  // Get file's type.
  public shared (msg) func getFileType(name : Text) : async ?Text {
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null;
      case (?file) ?file.fileType;
    };
  };

  // Delete a file.
  public shared (msg) func deleteFile(name : Text) : async Bool {
    Option.isSome(HashMap.remove(getUserFiles(msg.caller), thash, name));
  };

  // Get user transactions
  private func getUserTransactions(user : Principal) : [Transaction] {
    switch (HashMap.get(transactions, phash, user)) {
      case null { [] };
      case (?existingTransactions) { existingTransactions };
    };
  };

  // Save transactions for a user
  public shared (msg) func saveTransactions(userTransactions : [Transaction]) : async () {
    // Validate transactions
    for (tx in userTransactions.vals()) {
      if (Text.size(tx.id) == 0) {
        throw Error.reject("Transaction ID cannot be empty");
      };
      
      if (tx.amount < 0) {
        throw Error.reject("Transaction amount cannot be negative");
      };
      
      if (Text.size(tx.date) == 0) {
        throw Error.reject("Transaction date cannot be empty");
      };
    };
    
    let _ = HashMap.put(transactions, phash, msg.caller, userTransactions);
  };

  // Get all transactions for a user
  public shared (msg) func getTransactions() : async [Transaction] {
    getUserTransactions(msg.caller);
  };

  // Delete all transactions for a user
  public shared (msg) func deleteAllTransactions() : async () {
    let _ = HashMap.put(transactions, phash, msg.caller, []);
  };
  
  // Delete a specific transaction by ID
  public shared (msg) func deleteTransaction(id : Text) : async Bool {
    let userTxs = getUserTransactions(msg.caller);
    let filteredTxs = Array.filter(userTxs, func(tx : Transaction) : Bool { tx.id != id });
    
    if (filteredTxs.size() == userTxs.size()) {
      // No transaction was removed
      return false;
    };
    
    let _ = HashMap.put(transactions, phash, msg.caller, filteredTxs);
    true;
  };
  
  // Update a specific transaction
  public shared (msg) func updateTransaction(updatedTx : Transaction) : async Bool {
    let userTxs = getUserTransactions(msg.caller);
    
    // Validate transaction
    if (Text.size(updatedTx.id) == 0) {
      throw Error.reject("Transaction ID cannot be empty");
    };
    
    if (updatedTx.amount < 0) {
      throw Error.reject("Transaction amount cannot be negative");
    };
    
    if (Text.size(updatedTx.date) == 0) {
      throw Error.reject("Transaction date cannot be empty");
    };
    
    // Find and update the transaction
    let updatedTxs = Array.map(userTxs, func(tx : Transaction) : Transaction {
      if (tx.id == updatedTx.id) {
        updatedTx;
      } else {
        tx;
      };
    });
    
    // Check if any transaction was updated
    let txFound = Array.find(userTxs, func(tx : Transaction) : Bool { tx.id == updatedTx.id });
    if (Option.isNull(txFound)) {
      return false;
    };
    
    let _ = HashMap.put(transactions, phash, msg.caller, updatedTxs);
    true;
  };
};

