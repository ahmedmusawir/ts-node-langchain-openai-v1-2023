import Langchain_1 from "./modules/Langchain_1.js";
import Langchain_TXT from "./modules/Langchain_TXT.js";
import Langchain_URL from "./modules/Langchain_URL.js";

const langchain = new Langchain_URL();
// const langchain = new Langchain_TXT();

// langchain.main("My name is Moose?");

// Takes a text file, Splits it, Saves in a Faiss Vector Store Locally
// langchain.processTextToVectorStore();

// Using the vector store on Cyberize faq text
// langchain.useFaissVectorStrore();

// langchain.processURLToChromaVectorStore();

// langchain.processURLToFaissVectorStore();

// langchain.useFaissVectorStrore("What is SLG?");
// langchain.useFaissVectorStrore("What does SLG costs?");
// langchain.useFaissVectorStrore("Who does SLG works for?");
// langchain.useFaissVectorStrore("Who created SLG?");
// langchain.useFaissVectorStrore("Who is Mical?");
// langchain.useFaissVectorStrore("What is Cyberize Group?");
// langchain.useFaissVectorStrore("What is SpaceX?");
// langchain.useFaissVectorStrore("How can I get instant access?");
// langchain.useFaissVectorStrore("What is Local Business Doom?");
// langchain.useFaissVectorStrore(
//     "What is the actual value I'll receive if I spend $27"
//     );
// langchain.useFaissVectorStrore("What was Mical doing on Aug, 22nd, 1999?");
// langchain.useFaissVectorStrore("How old was Mical on Aug, 22nd, 1999?");
// langchain.useFaissVectorStrore("What did Mical hate?");
// langchain.useFaissVectorStrore(
//   "What is the difference between SLG and old way of doing things?"
// );
// langchain.useFaissVectorStrore("What is the big idea behind SLG system?");
// langchain.useFaissVectorStrore("What are the tools I can get from SLG?");
// langchain.useFaissVectorStrore("When does the offer expires?");
