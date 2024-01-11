import ChromaDB_Test from "../src/modules/ChromaDB_Test.js";

const chromaDBTest = new ChromaDB_Test();

// CREATE A CHROMA DB COLLECTION
// chromaDBTest.createChromaCollection("chromaMooseCol_2");

// DELETE A CHROMA DB COLLECTION
// chromaDBTest.deleteChromaCollection("chromaMooseCol_2");

// GET A LIST OF CHROMA DB COLLECTIONS
chromaDBTest.getChromaCollections();
