import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Represents a class for handling various types of OpenAI model interactions.
 * This includes simple one-time executions and agents with specialized tools like calculators or search APIs.
 *
 * @class Langchain_PDF
 * @property {OpenAI} model - The instance of the OpenAI model used for all interactions.
 */
class Langchain_PDF {
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
  async processPDFToVectorStore() {
    const loader = new PDFLoader("source_docs/CV_Moose.pdf", {
      parsedItemSeparator: "",
      splitPages: false,
    });

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    const documents = await splitter.splitDocuments(docs);
    // console.log("Split Docs", documents);

    const embeddings = new OpenAIEmbeddings();
    // console.log("Embeddings:", embeddings);

    const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
    await vectorstore.save("./vector-store-pdf");

    console.log("PDF to Faiss Vector Store Created successfully");
  }

  /** Using a Faiss Vector Store in a Chatbot */
  async useFaissVectorStrore(prompt: string) {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load("./vector-store-pdf", embeddings);

    /** Using Prompt Templating */
    const template = `The given context is Ahmed's resume. Use the following pieces of context to answer the question at the end. When answering.  
    If you don't know the answer, just say that you don't know, don't try to make up an answer. Use three sentences maximum and keep the answer as concise as possible. Also, you MUST provide the {question} in all uppercase format at the top of every answer. Always say "thanks for asking!" at the end of the answer.
    {context} 
    Question: {question}
    Display the Question: 
    Answer only here (MUST be in all lowercase letters. You MUST use person's name found in the context to replace he/she every time (example: Ahmed did ..., Ahmed studied ... etc. If the answer contains a list of things (for example: what did he do? what does he know? etc.) You MUST answer in List Format.):`;

    const QA_CHAIN_PROMPT = new PromptTemplate({
      inputVariables: ["context", "question"],
      template,
    });

    /** Getting answers via Q/A from the vector store */
    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(this.model, {
        prompt: QA_CHAIN_PROMPT,
      }),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const res = await chain.call({
      systemPrompt:
        "This is a resume. Please provide information based on the resume. Under the Experience heading shows all the companies this person worked for over the years. Also shows starting and ending dates for specific company",
      query: prompt,
    });
  }
}

export default Langchain_PDF;
