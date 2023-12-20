import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChromaClient } from "chromadb";
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Testing the Langchain Chat Models which can continue a conversation
 *
 * @class ChromaDB_Test
 */
class ChromaDB_Test {
  private model: ChatOpenAI;
  private chromaClient: ChromaClient;
  private chromaURL: string;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new ChatOpenAI({
      temperature: 0.5,
      // temperature: 0, // for maths or code
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

    // ChromaDB URL
    this.chromaURL = "http://157.230.43.210:8000";

    // Chroma Client
    this.chromaClient = new ChromaClient({ path: this.chromaURL });
  }

  async main() {
    // main function code
  }

  async getChromaCollections() {
    // Getting all collections
    const collections = await this.chromaClient.listCollections();
    console.log("Current DigitalOcean Chroma Collections:", collections);
  }

  async createChromaCollection(collectionName: string) {
    try {
      const collection = await this.chromaClient.createCollection({
        name: collectionName,
      });
      console.log("Collection created:", collection);
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  }

  async deleteChromaCollection(collectionName: string) {
    try {
      await this.chromaClient.deleteCollection({ name: collectionName });
      console.log(`Collection ${collectionName} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  }
}

export default ChromaDB_Test;
