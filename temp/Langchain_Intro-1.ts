import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, SimpleSequentialChain } from "langchain/chains";
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
 * @class Langchain_Intro
 * @property {OpenAI} model - The instance of the OpenAI model used for all interactions.
 */
class Langchain_Intro {
  private model: OpenAI;

  constructor() {
    // Create a new instance of the OpenAI model
    this.model = new OpenAI({
      temperature: 0.5,
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
  async promptTemplate(prompt: string) {
    const firstTemplate =
      "What would be a good shop name for a business that sells {product}";

    const promptTemp = new PromptTemplate({
      template: firstTemplate,
      inputVariables: ["product"],
    });

    const formattedPrompt = await promptTemp.format({
      product: prompt,
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
   * Demonstrates a basic example of prompt chaining with the OpenAI model.
   * Utilizes a templated prompt and processes it through a language model chain.
   */
  async promptTemplateChain(prompt: string) {
    const firstTemplate =
      "What would be a good shop name for a business that sells {product}. Give me a few examples.";

    const promptTemp = new PromptTemplate({
      template: firstTemplate,
      inputVariables: ["product"],
    });

    // console.log("Prompt Template", promptTemp);
    // const formattedPrompt = await promptTemp.format({
    //   product: prompt,
    // });
    // console.log("Formatted Prompt:", formattedPrompt);

    const chain = new LLMChain({
      llm: this.model,
      prompt: promptTemp,
    });

    // Make an asynchronous call to the model
    try {
      const res = await chain.call({
        product: prompt,
      });
      console.log(res.text);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Demonstrates chaining multiple prompts with the OpenAI model.
   * Utilizes a templated prompt and processes it through a language model chain.
   */
  async promptTemplateMultiChain(userCountry: string) {
    // First step in chain
    const firstTemplate =
      "What is the most popular city in {country} for tourists? Just return the name of the city";
    const firstPrompt = new PromptTemplate({
      inputVariables: ["country"],
      template: firstTemplate,
    });
    const chainOne = new LLMChain({
      llm: this.model,
      prompt: firstPrompt,
    });

    // Second step in chain
    const secondTemplate =
      "What are the top three things to do in this: {city} for tourists. Just return the answer as three bullet points. And display the {city} in all uppercase above your list";
    const secondPrompt = new PromptTemplate({
      inputVariables: ["city"],
      template: secondTemplate,
    });
    const chainTwo = new LLMChain({
      llm: this.model,
      prompt: secondPrompt,
    });

    // Combine the first and the second chain
    const overallChain = new SimpleSequentialChain({
      chains: [chainOne, chainTwo],
      verbose: false,
    });

    // Run the overall chain with a country as input
    try {
      const finalAnswer = await overallChain.run(userCountry);
      console.log(finalAnswer);
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
          verbose: false,
        }
      );
      console.log("The agent loaded ...");

      const res = await executor.call({
        input: "Plz give me the result of 23 raised to the power 0.23",
        // input: "Find me the Champion Country in the World Cup Cricket 2023",
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
    console.log(res1.response);
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
      "Will Trump win next year? What is your reasoning behind your answer?"
    );

    console.log(res);
  }
}

export default Langchain_Intro;
