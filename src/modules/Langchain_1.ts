import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Calculator } from "langchain/tools/calculator";
import { SearchApi } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
// Initialize dotenv to load environment variables
dotenv.config();

/**
 * Represents a class for handling various types of OpenAI model interactions.
 * This includes simple one-time executions and agents with specialized tools like calculators or search APIs.
 *
 * @class Langchain_1
 * @property {OpenAI} model - The instance of the OpenAI model used for all interactions.
 */
class Langchain_1 {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      // temperature: 0.5,
      temperature: 0, // for maths or code
      modelName: "gpt-3.5-turbo",
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
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  /**
   * Demonstrates using a templated prompt for the OpenAI model call.
   * It formats the prompt using predefined templates and input variables.
   */
  async promptTemplate() {
    const firstTemplate =
      "What would be a good company name for a company that makes {product}";

    const promptTemp = new PromptTemplate({
      template: firstTemplate,
      inputVariables: ["product"],
    });

    const formattedPrompt = await promptTemp.format({
      product: "Ganja",
    });

    console.log("Formatted Prompt::", formattedPrompt);
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call(formattedPrompt);
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  /**
   * Demonstrates chaining multiple prompts with the OpenAI model.
   * Utilizes a templated prompt and processes it through a language model chain.
   */
  async promptTemplateChain() {
    const firstTemplate =
      "What would be a good company name for a company that makes {product}";

    const promptTemp = new PromptTemplate({
      template: firstTemplate,
      inputVariables: ["product"],
    });

    const chain = new LLMChain({
      llm: this.model,
      prompt: promptTemp,
    });

    // Make an asynchronous call to the model
    try {
      const res = await chain.call({
        product: "AI Tools",
      });
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  /**
   * Demonstrates the use of agents like a calculator or search API with the OpenAI model.
   * Initializes agents and makes a call with a specific input.
   */
  async promptAgent() {
    const tools = [
      new Calculator(),
      new SearchApi("5rPbeihLvBqdhLPThhxAwPXv", {
        engine: "google_news",
      }),
    ];
    // Make an asynchronous call to the model
    try {
      const executor = await initializeAgentExecutorWithOptions(
        tools,
        this.model,
        {
          agentType: "structured-chat-zero-shot-react-description",
          verbose: true,
        }
      );
      console.log("Loaded the agent ...");

      const res = await executor.call({
        input: "Plz give me the result of 23 raised to the power 0.23",
        // input: "Search the web and find me the current weather in Kuala Lumpur and plz let me know the url of the website you found this info from",
      });

      console.log(res.output);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  /**
   * Demonstrates the use of conversation chains with memory capability.
   * Utilizes conversation chains to maintain context across multiple prompts.
   */
  async promptChainWithMemory() {
    const memory = new BufferMemory();
    const chain = new ConversationChain({
      llm: this.model,
      memory: memory,
    });

    const res1 = await chain.call({
      input: "Hi, I'm Moose.",
    });
    console.log(res1);
    const res2 = await chain.call({
      input: "What is my name",
    });
    console.log(res2);
  }
  /**
   * Demonstrates streaming responses from the OpenAI model.
   * Handles real-time token-based responses from the model.
   */
  async promptStreaming() {
    const model = new OpenAI({
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

    const res = await model.call(
      "Will Trump win next year? What is your reasonign behind your answer?"
    );

    console.log(res);
  }
}

export default Langchain_1;
