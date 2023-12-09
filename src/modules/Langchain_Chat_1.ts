import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Calculator } from "langchain/tools/calculator";
import { SearchApi } from "langchain/tools";
import { ChatAgent, AgentExecutor } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
// import SerperSearchApi from "../tools/SerperSearchApi.js";
// const { GoogleSerperAPIWrapper } = require('langchain').utilities;
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Testing the Langchain Chat Models which can continue a conversation
 *
 * @class Langchain_Chat_1
 */
class Langchain_Chat_1 {
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
  /**
   * Makes an asynchronous call to the OpenAI model with a given prompt.
   * Logs the response or error to the console.
   *
   * @param {string} prompt - The prompt to be sent to the OpenAI model.
   */
  async main(prompt: string) {
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call([new HumanMessage(prompt)]);
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
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
      //   const res = await this.model.call(
      //     [
      //     new SystemMessage(
      //       "Your name is Vincent Bangali. You are a helpful assistant that translates English to Bengali. And answer only with Bengali pronunciations in English so that non bengali speakers can read, no need for the actual language letters and syntanx at this time. For example: 'I am Vincent' should be only 'Amar nam Vincent'"
      //     ),
      //     new HumanMessage(prompt),
      //   ]);
      //   console.log(res.content);

      const res = await this.model.generate([
        [
          new SystemMessage(
            "Your name is Vincent Bangali. You are a helpful assistant that translates English to Bengali. And answer only with Bengali pronunciations in English so that non bengali speakers can read, no need for the actual language letters and syntanx at this time. For example: 'I am Vincent' should be only 'Amar nam Vincent'"
          ),
          new HumanMessage(prompt),
        ],
        [
          new SystemMessage(
            "Your name is Vincent Mal-wani. You are a helpful assistant that translates English to HINDI. And answer only with Hindi pronunciations in English so that non hindi speakers can read, no need for the actual language letters and syntanx at this time. For example: 'I am Vincent' should be only 'Mera nam Vincent'"
          ),
          new HumanMessage(prompt),
        ],
      ]);

      console.log(res.generations);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async customAssistantTemplate(prompt: string) {
    const translationPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Your name is Vincent Mal-wani. You are a helpful assistant that translates {input_lang} to {output_lang}. And answer only with {output_lang} pronunciations in {input_lang} so that non {output_lang} speakers can read, no need for the actual language letters and syntanx at this time. For example (English to Hindi): 'I am Vincent' should be only 'Mera nam Vincent hay'"
      ),
      HumanMessagePromptTemplate.fromTemplate("{user_text}"),
    ]);

    const formattedPrompt = await translationPrompt.formatPromptValue({
      input_lang: "English",
      output_lang: "Hindi",
      //   output_lang: "Tagalog",
      user_text: prompt,
    });

    // console.log(formattedPrompt.messages);

    // THE FOLLOWING WILL WORK WITH THE formattedPrompt
    // try {
    //   const res = await this.model.generatePrompt([formattedPrompt]);
    //   console.log(res.generations);
    // } catch (error) {
    //   console.error("Error:", error);
    // }

    // THE FOLLOWING WITH WORK WITH THE translationPrompt
    const chain = new LLMChain({
      prompt: translationPrompt,
      llm: this.model,
    });

    const res = await chain.call({
      input_lang: "English",
      output_lang: "Hindi",
      user_text: prompt,
    });

    console.log(res);
  }

  async customChatAgent(prompt: string) {
    const tools = [
      new Calculator(),
      new SearchApi("5rPbeihLvBqdhLPThhxAwPXv", {
        engine: "google_news",
      }),
    ];

    const agent = ChatAgent.fromLLMAndTools(this.model, tools);

    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      //   verbose: true,
    });

    const res = await executor.run(prompt);

    console.log(res);
  }

  async customChatMemory(prompt1: string, prompt2: string) {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "The following is a friendly conversation between a human and AI. The AI is talkative and provides lots of specific details from it's context. If the AI doesn't know the answer to a question, it truthfully says it doesn't know."
      ),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{user_input}"),
    ]);

    const chain = new ConversationChain({
      llm: this.model,
      prompt: chatPrompt,
      memory: new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
      }),
    });

    const res = await chain.call({
      user_input: prompt1,
    });

    console.log(res);

    const res2 = await chain.call({
      user_input: prompt2,
    });

    console.log(res2);
  }
}

export default Langchain_Chat_1;
