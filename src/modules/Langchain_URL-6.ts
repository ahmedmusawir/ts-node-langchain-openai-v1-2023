import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import * as cheerio from "cheerio";
import { Chroma } from "langchain/vectorstores/chroma";
import fs from "fs";
import * as puppeteer from "puppeteer";
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
  async processURLToChromaVectorStore() {
    const url = "https://simplifiedlocalgrowth.com/slg-1/";

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

    const docs = await loader.load();
    const pageContent = docs[0].pageContent; // Access the extracted text content

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

    console.log(textContent);
    // Post-process the extracted text (example)
    const postProcessedText = textContent.replace(/[^\x20-\x7E]+/g, ""); // Remove non-ASCII characters

    // console.log(postProcessedText);
  }

  /** Using a Faiss Vector Store in a Chatbot */
  async useFaissVectorStrore() {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store", embeddings);

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

export default Langchain_URL;
