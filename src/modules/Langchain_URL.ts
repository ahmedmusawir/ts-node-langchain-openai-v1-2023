import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import {
  ConversationalRetrievalQAChain,
  RetrievalQAChain,
  loadQAStuffChain,
} from "langchain/chains";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";
import { Document } from "langchain/document";
import { BufferMemory } from "langchain/memory";

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
 * @class Langchain_URL
 */
class Langchain_URL {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      temperature: 0.5,
      // modelName: "gpt-3.5-turbo",
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
  async processURLToFaissVectorStore() {
    const url = "https://simplifiedlocalgrowth.com/slg-1/";

    console.log("Making the call to:", url);

    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: "new",
      },
      async evaluate(page: puppeteer.Page, browser: puppeteer.Browser) {
        try {
          await page.goto(url, { waitUntil: "networkidle0" });
          const textContent = await page.evaluate(() => {
            // Clean up the HTML content and extract the text
            const bodyElement = document.querySelector("body");
            return bodyElement ? bodyElement.textContent : "";
          });
          await browser.close();
          return textContent || "";
        } catch (error) {
          console.error("Error occurred while loading the page: ", error);
          await browser.close();
          return ""; // return empty string in case of an error
        }
      },
    });

    console.log("Loading URL to Docs");

    const urlDocs = await loader.load();
    const pageContent = urlDocs[0].pageContent; // Access the extracted text content

    // console.log(pageContent);

    // Load the HTML content into cheerio
    const $ = cheerio.load(pageContent);

    $("script, style").remove(); // Remove unnecessary elements

    // Further clean-up using regular expressions (example)
    const cleanedText = $("body")
      .html()
      ?.replace(/<style[^>]*>.*<\/style>/gms, "");

    // Load the cleaned HTML again to extract text
    const cleaned$ = cheerio.load(cleanedText!);

    // Extract the text from the HTML content
    const textContent = cleaned$("body").text();

    // console.log(textContent);

    const docs = textContent.replace(/[^\x20-\x7E]+/g, ""); // Remove non-ASCII characters

    // console.log(docs);

    // Create Document instances
    const documents = [new Document({ pageContent: docs })];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    const splitDocuments = await splitter.splitDocuments(documents);

    console.log(splitDocuments);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings();
    // Process and store embeddings in batches
    const batchSize = 10; // Adjust based on your needs
    let allDocs = [];

    for (let i = 0; i < splitDocuments.length; i += batchSize) {
      const batch = splitDocuments.slice(i, i + batchSize);

      // Add batch documents to allDocs array
      allDocs.push(...batch);
    }

    // Load the docs into the vector store
    const vectorStore = await FaissStore.fromDocuments(allDocs, embeddings);

    await vectorStore.save("./vector-store-url");

    console.log("Faiss Vector store created successfully!");
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
    });
  }

  /** Using a Faiss Vector Store in a Chatbot */

  async useFaissVectorStoreWithMemory(prompt: string) {
    // Load your existing Faiss vector store
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-url", embeddings);

    // Initialize chat memory
    const memory = new BufferMemory({
      memoryKey: "chat_history",
    });

    // Create a Conversational Retrieval QA Chain with memory and custom question generator options
    const chain = new ConversationalRetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model),
      retriever: vectorStore.asRetriever(),
      memory: memory,
      questionGeneratorChain: {
        prompt: "Generate a question based on the given context.",
        llm: this.model,
      },
      returnSourceDocuments: true,
    });
    // Call the chain with your query
    const res = await chain.call({
      query: prompt,
    });

    console.log(res);
  }
}
export default Langchain_URL;
