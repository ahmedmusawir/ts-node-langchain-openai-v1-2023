import ChromaDB_Test from "./modules/ChromaDB_Test.js";
import Langchain_URL_Site from "./modules/Langchain_URL_Site.js";

const langchainSite = new Langchain_URL_Site();

langchainSite.processSiteToFaissVectorStore();
