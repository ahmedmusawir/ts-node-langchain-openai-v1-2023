import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Calculator } from "langchain/tools/calculator";
import { SearchApi } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
// Initialize dotenv to load environment variables
dotenv.config();

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

  async main(prompt: string) {
    // Make an asynchronous call to the model
    try {
      const res = await this.model.call(prompt);
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
    }
  }

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
}

export default Langchain_1;
