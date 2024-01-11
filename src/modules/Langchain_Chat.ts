import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Testing the Langchain Chat Models which can continue a conversation
 *
 * @class Langchain_Chat
 */
class Langchain_Chat {
  private model: ChatOpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new ChatOpenAI({
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
  async customAssistant(prompt: string) {
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call([
        new SystemMessage(
          "Your name is Rico. You are a very funny guy. Answer every question with short sentence and with a sense of humor "
        ),
        new HumanMessage(prompt),
      ]);
      // console.log(res.content);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async customAssistantTemplate(outputLang: string, prompt: string) {
    const translationPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Your name is Vincent Mal-wani. You are a helpful assistant that translates {input_lang} to {output_lang}. And answer only with {output_lang} pronunciations in {input_lang} so that non {output_lang} speakers can read, DO NOT  output the actual language letters and syntanx at this time. For example (English to Hindi): 'I am Vincent' should be only 'Mera nam Vincent hay'"
      ),
      HumanMessagePromptTemplate.fromTemplate("{user_text}"),
    ]);

    // THE FOLLOWING WITH WORK WITH THE translationPrompt
    const chain = new LLMChain({
      prompt: translationPrompt,
      llm: this.model,
    });

    const res = await chain.call({
      input_lang: "English",
      output_lang: outputLang,
      user_text: prompt,
    });

    // console.log(res);
  }
}

export default Langchain_Chat;
