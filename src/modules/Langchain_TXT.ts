import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { Chroma } from "langchain/vectorstores/chroma";

// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Represents a class for handling various types of OpenAI model interactions.
 * This includes simple one-time executions and agents with specialized tools like calculators or search APIs.
 *
 * @class Langchain_1
 * @property {OpenAI} model - The instance of the OpenAI model used for all interactions.
/**
 *
 *
 * @class Langchain_TXT
 */
class Langchain_TXT {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      temperature: 0.5,
      modelName: "gpt-3.5-turbo",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            process.stdout.write(token);
          },
        },
      ],
    });
  }

  /**
   * Processes a Text file, Splits it, Creates Vector Embeddings, Stores in a Faiss Store
   */
  async processTextToVectorStore() {
    const txtLoader = new TextLoader("source_docs/openai_faq.txt");
    // console.log("The Text file:", txtLoader);
    const docs = await txtLoader.load();
    // console.log("The Text file:", docs);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    const documents = await splitter.splitDocuments(docs);
    // console.log("Split Docs", documents);

    const embeddings = new OpenAIEmbeddings();
    // console.log("Embeddings:", embeddings);

    const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
    await vectorstore.save("./vector-store-txt");

    console.log("Faiss Vector Store Created Successfully!");
  }

  /** Using a Faiss Vector Store in a Chatbot */
  async useFaissVectorStrore(question: string) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-txt", embeddings);

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
      verbose: true,
    });

    const res = await chain.call({
      query: question,
    });

    console.log("THE ANSWER:", res.text);
  }

  /** Vector store with ChromaDB on Digital Ocean */
  async processTextToChromaDB(collectionName: string) {
    // Existing code to load and split documents
    const loader = new TextLoader("source_docs/openai_faq.txt");
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });
    const documents = await splitter.splitDocuments(docs);

    // Create vector store and index the docs with Chroma
    const vectorStore = await Chroma.fromDocuments(
      documents,
      new OpenAIEmbeddings(),
      {
        collectionName: collectionName, // Replace with your collection name
        url: "http://157.230.43.210:8000", // Your Chroma DB URL
        collectionMetadata: {
          "hnsw:space": "cosine",
        },
      }
    );

    console.log("Chroma Vector Store Created:", vectorStore);
  }

  /** Using a ChromaDB Vector Store in a Chatbot */
  async useChromaVectorStore(prompt: string) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "moose-txt-youtube", // Your collection name
      url: "http://157.230.43.210:8000", // Your Chroma DB URL
    });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const res = await chain.call({
      query: prompt,
    });

    // console.log(res);

    // res.sourceDocuments.forEach((doc: any) => {
    //   console.log(doc.metadata);
    // });
  }
}

export default Langchain_TXT;
