import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Testing the Langchain Chat Models which can continue a conversation
 *
 * @class Template_Copy_Me
 */
class Template_Copy_Me {
  private model: ChatOpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new ChatOpenAI({
      temperature: 0.5,
      modelName: "gpt-3.5-turbo",
    });
  }

  async main() {
    // main function code
    console.log("We Are Good To Go 2025...!!");
  }

  async sampleFunction(prompt1: string, prompt2: string) {
    // sub function code
  }
}

export default Template_Copy_Me;
