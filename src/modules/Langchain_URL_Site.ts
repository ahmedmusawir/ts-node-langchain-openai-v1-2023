import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import * as cheerio from "cheerio";
import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import * as puppeteer from "puppeteer";
import { Document } from "langchain/document";

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
 * @class Langchain_URL_Site
 */
class Langchain_URL_Site {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      temperature: 0.5,
      // modelName: "text-embedding-ada-002",
      modelName: "gpt-4-1106-preview",
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
  async processSiteToFaissVectorStore() {
    const url = "https://cyberizegroup.com/";

    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 5,
      excludeDirs: [],
      timeout: 10000,
      preventOutside: true,
    });

    // const urlSiteDocs = await loader.load();
    // console.log(urlSiteDocs);

    //---------------------------------------------
    loader
      .load()
      .then((urlSiteDocs) => {
        console.log(urlSiteDocs);
        urlSiteDocs.map((page) => {
          console.log(page.metadata.source);
        });
      })
      .catch((error) => {
        console.error("Error loading pages:", error);
      });
    //---------------------------------------------

    // Create Document instances

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    // const splitDocuments = await splitter.splitDocuments(documents);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings();
    // Process and store embeddings in batches
    const batchSize = 10; // Adjust based on your needs
    // let allDocs = [];

    // for (let i = 0; i < splitDocuments.length; i += batchSize) {
    //   const batch = splitDocuments.slice(i, i + batchSize);

    //   // Add batch documents to allDocs array
    //   allDocs.push(...batch);
    // }

    // Load the docs into the vector store
    // const vectorStore = await FaissStore.fromDocuments(allDocs, embeddings);

    // await vectorStore.save("./vector-store-website");
  }

  /** Using a Faiss Vector Store in a Chatbot */
  async useFaissVectorStrore(prompt: string) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-url", embeddings);

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const res = await chain.call({
      query: prompt,
      //   query: "What is CALL-E?",
    });
  }
}

export default Langchain_URL_Site;
