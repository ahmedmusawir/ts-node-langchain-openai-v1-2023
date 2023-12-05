import { OpenAI } from 'langchain/llms/openai';
import dotenv from 'dotenv';

// Initialize dotenv to load environment variables
dotenv.config();

class Langchain_1 {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      temperature: 0.5,
      modelName: 'gpt-3.5-turbo',
    });
  }

  async main(prompt: string) {
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call(prompt);
      console.log(res);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default Langchain_1;
