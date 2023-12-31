import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
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
   * Makes an asynchronous call to the OpenAI model with a given prompt.
   * Logs the response or error to the console.
   *
   * @param {string} prompt - The prompt to be sent to the OpenAI model.
   */
  async main(prompt: string) {
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call(prompt);
      //   console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
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
    await vectorstore.save("./vector-store");
  }

  /** Using a Faiss Vector Store in a Chatbot */
  async useFaissVectorStrore() {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-txt", embeddings);

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const res = await chain.call({
      query: "What are the products of cyberize?",
      //   query: "What is CALL-E?",
      //   query: "When was Cyberize company started?",
    });
  }
}

export default Langchain_TXT;
