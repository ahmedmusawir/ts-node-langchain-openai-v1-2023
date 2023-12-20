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
  }

  async main() {
    // main function code
  }

  async sampleFunction(prompt1: string, prompt2: string) {
    // sub function code
  }
}

export default Template_Copy_Me;
